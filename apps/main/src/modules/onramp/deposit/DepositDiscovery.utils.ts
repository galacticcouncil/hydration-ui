import { formatSourceChainAddress, isH160Address } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { tags } from "@galacticcouncil/xc-cfg"
import { type AssetAmount, Parachain } from "@galacticcouncil/xc-core"
import Big from "big.js"

import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
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
export type DepositUnavailableBalance = DepositBalanceRow & {
  reason: "noRoute" | "tooSmall"
}
export type DepositAssetGroup = {
  key: string
  assetKey: string
  symbol: string
  rows: DepositBalanceRow[]
  amount: string
  value?: string
  unpriced: number
  routeCount: number
  claimRequired: boolean
  claimPossible: boolean
}

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

/** Only a static source reserve can prove max=0 without quoting a destination route. */
export const getDepositUnavailableReason = (
  row: DepositBalanceRow,
): DepositUnavailableBalance["reason"] | undefined => {
  if (!row.source.assets.some((asset) => asset.key === row.balance.key))
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

export const groupDepositBalances = (rows: DepositBalanceRow[]) => {
  const supported: DepositBalanceRow[] = []
  const unsupported: DepositUnavailableBalance[] = []
  const grouped = new Map<string, DepositBalanceRow[]>()
  const seen = new Set<string>()
  for (const row of rows) {
    if (row.balance.amount <= 0n || seen.has(row.key)) continue
    seen.add(row.key)
    const reason = getDepositUnavailableReason(row)
    if (reason) {
      unsupported.push({ ...row, reason })
      continue
    }
    supported.push(row)
    const group = grouped.get(row.balance.key) ?? []
    group.push(row)
    grouped.set(row.balance.key, group)
  }
  const groups: DepositAssetGroup[] = [...grouped]
    .map(([assetKey, items]) => {
      const summary = summarizeDepositBalances(items)
      const routes = new Map<string, { manualClaim: boolean }>()
      for (const row of items) {
        const matchingRoutes = row.source.routes.filter(
          (route) => route.source.asset.key === assetKey,
        )
        if (!matchingRoutes.length) {
          routes.set(`${row.source.chain.key}:${assetKey}`, {
            manualClaim: false,
          })
          continue
        }
        for (const route of matchingRoutes) {
          const routeTags = (route.tags ?? []) as string[]
          const key = `${row.source.chain.key}:${route.destination.asset.key}:${[...routeTags].sort().join(",")}`
          routes.set(key, {
            manualClaim:
              routeTags.includes(tags.Tag.Wormhole) &&
              !routeTags.includes(tags.Tag.NttExecutor) &&
              !routeTags.includes(tags.Tag.Basejump),
          })
        }
      }
      const choices = [...routes.values()]
      return {
        key: assetKey,
        assetKey,
        symbol: items[0]!.balance.originSymbol,
        rows: [...items].sort(
          (a, b) =>
            Big(`${b.balance.amount}e-${b.balance.decimals}`).cmp(
              Big(`${a.balance.amount}e-${a.balance.decimals}`),
            ) || a.key.localeCompare(b.key),
        ),
        amount: items
          .reduce(
            (sum, row) =>
              sum.plus(Big(`${row.balance.amount}e-${row.balance.decimals}`)),
            Big(0),
          )
          .toString(),
        value: summary.unpriced ? undefined : summary.total,
        unpriced: summary.unpriced,
        routeCount: routes.size,
        claimRequired:
          choices.length > 0 && choices.every((route) => route.manualClaim),
        claimPossible: choices.some((route) => route.manualClaim),
      }
    })
    .sort((a, b) => {
      if (a.value === undefined && b.value !== undefined) return 1
      if (a.value !== undefined && b.value === undefined) return -1
      return (
        Big(b.value ?? "0").cmp(a.value ?? "0") || a.key.localeCompare(b.key)
      )
    })
  return { ...summarizeDepositBalances(supported), groups, unsupported }
}
