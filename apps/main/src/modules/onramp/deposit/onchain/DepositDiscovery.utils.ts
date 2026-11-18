import { formatSourceChainAddress, isH160Address } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { type AssetAmount, Parachain } from "@galacticcouncil/xc-core"
import type { UseQueryResult } from "@tanstack/react-query"
import Big from "big.js"

import { canUseDepositAccount } from "@/modules/onramp/deposit/onchain/DepositOnchain.utils"
import type { DepositWalletResult } from "@/modules/onramp/deposit/onchain/hooks/useDepositWallets.utils"
import type { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect"

export type DepositSource = ChainAssetPair & {
  key: string
  account: Account
  accounts: Account[]
}
export type DepositBalanceRow = {
  key: string
  source: DepositSource
  balance: AssetAmount
  value?: string
}
export type DepositUnavailableReason = "noRoute" | "tooSmall"

export const getDepositSources = (
  accounts: Account[],
  pairs: ChainAssetPair[],
): DepositSource[] => {
  const sources = new Map<string, DepositSource>()
  for (const pair of pairs)
    for (const account of accounts) {
      if (!canUseDepositAccount(account, pair.chain)) continue
      const address = formatSourceChainAddress(account.rawAddress, pair.chain)
      if (!address) continue
      // Several extensions expose the same funds; keep all signers but query/count once.
      const key = `${pair.chain.key}:${isH160Address(address) ? address.toLowerCase() : address}`
      const existing = sources.get(key)
      if (!existing)
        sources.set(key, { ...pair, key, account, accounts: [account] })
      else if (
        !existing.accounts.some(
          (alias) =>
            alias.provider === account.provider &&
            alias.address === account.address,
        )
      )
        existing.accounts.push(account)
    }
  return [...sources.values()]
}

export const filterDepositBalancesByProviders = (
  rows: DepositBalanceRow[],
  providers: readonly WalletProviderType[] | null,
): DepositBalanceRow[] => {
  if (!providers) return rows
  return rows.flatMap((row) => {
    const account = row.source.accounts.find((alias) =>
      providers.includes(alias.provider),
    )
    return account ? [{ ...row, source: { ...row.source, account } }] : []
  })
}

export const summarizeDepositBalances = (rows: DepositBalanceRow[]) => {
  const total = rows
    .reduce(
      (sum, row) => (row.value === undefined ? sum : sum.plus(row.value)),
      Big(0),
    )
    .toString()
  const sorted = [...rows].sort((a, b) => {
    if (a.value === undefined && b.value !== undefined) return 1
    if (a.value !== undefined && b.value === undefined) return -1
    return Big(b.value ?? "0").cmp(a.value ?? "0") || a.key.localeCompare(b.key)
  })
  return {
    rows: sorted,
    total,
    unpriced: rows.filter((row) => row.value === undefined).length,
  }
}

// Upstream-broken routes, keyed `chain:asset` (#130). pendulum:pen: Hydration can't
// price PEN (`WeightNotComputable`), so `dry_run_xcm` fails BuyExecution with `AssetNotFound`.
const BROKEN_ROUTES = new Set(["pendulum:pen"])

/** Only a static source reserve can prove max=0 without quoting a destination route. */
export const getDepositUnavailableReason = (
  row: DepositBalanceRow,
): DepositUnavailableReason | undefined => {
  if (
    !row.source.assets.some((asset) => asset.key === row.balance.key) ||
    BROKEN_ROUTES.has(`${row.source.chain.key}:${row.balance.key}`)
  )
    return "noRoute"
  const { chain } = row.source
  if (!(chain instanceof Parachain) || chain.getMinType() !== undefined)
    return undefined
  const reserve = chain.getAssetMin(row.balance)
  return Number.isFinite(reserve) &&
    reserve > 0 &&
    row.balance.amount > 0n &&
    Big(`${row.balance.amount}e-${row.balance.decimals}`).lte(reserve)
    ? "tooSmall"
    : undefined
}

// Only `pending` is unsettled: errors settle, and background refetches never un-settle.
export const getDiscoveryProgress = (
  wallets: readonly DepositWalletResult[],
  fetches: readonly Pick<UseQueryResult, "status">[],
) => {
  const settled =
    wallets.filter((result) => result !== "waiting" && result !== "pending")
      .length + fetches.filter((fetch) => fetch.status !== "pending").length
  const total = wallets.length + fetches.length
  return { settled, total, isSettled: settled === total }
}

/** Keep positive, routable Holdings once each; `noRoute`/`tooSmall` rows are dropped. */
export const groupDepositBalances = (rows: DepositBalanceRow[]) => {
  const seen = new Set<string>()
  const holdings = rows.filter((row) => {
    if (row.balance.amount <= 0n || seen.has(row.key)) return false
    seen.add(row.key)
    return !getDepositUnavailableReason(row)
  })
  return summarizeDepositBalances(holdings)
}
