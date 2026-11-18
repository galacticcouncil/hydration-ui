import type { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import {
  useCrossChainWallet,
  useHydrationAssetId,
  xcmBalanceSnapshotQuery,
} from "@/api/xcm"
import {
  DepositBalanceRow,
  filterDepositBalancesByProviders,
  getDepositSources,
  getDiscoveryProgress,
  groupDepositBalances,
} from "@/modules/onramp/deposit/onchain/DepositDiscovery.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/onchain/hooks/useDepositAccounts"
import { useDepositWalletConnectionState } from "@/modules/onramp/deposit/onchain/hooks/useDepositWallets"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

type DepositDiscoveryOptions = {
  /** Wallet brand to show Holdings for; `null` shows every connected wallet. */
  provider: WalletProviderType | null
}

/** Finds every Holding of the connected signer accounts on chains routable to the XcmProvider's destination. */
export const useDepositDiscovery = ({ provider }: DepositDiscoveryOptions) => {
  const accounts = useDepositAccounts()
  const wallet = useCrossChainWallet()
  const { sourceChainAssetPairs } = useXcmProvider()
  const sources = useMemo(
    () => getDepositSources(accounts, sourceChainAssetPairs),
    [accounts, sourceChainAssetPairs],
  )
  const results = useQueries({
    queries: sources.map((source) =>
      xcmBalanceSnapshotQuery(
        wallet,
        source.chain.key,
        source.account.rawAddress,
      ),
    ),
  })

  const walletResults = useDepositWalletConnectionState(
    (state) => state.results,
  )

  const getAssetId = useHydrationAssetId()
  const rawRows = sources.flatMap((source, index) =>
    (results[index]?.data ?? [])
      .filter((balance) => balance.amount > 0n)
      .map((balance) => ({
        key: `${source.key}:${balance.key}`,
        source,
        balance,
        assetId: getAssetId(balance, source.chain.key),
      })),
  )
  const { getAssetPrice } = useAssetsPrice(
    rawRows.flatMap((row) => (row.assetId ? [row.assetId] : [])),
  )
  const pricedRows = rawRows.map(({ assetId, ...row }): DepositBalanceRow => {
    const price = assetId ? getAssetPrice(assetId) : undefined
    return {
      ...row,
      value: price?.isValid
        ? Big(toDecimal(row.balance.amount, row.balance.decimals))
            .times(price.price)
            .toString()
        : undefined,
    }
  })

  // A brand can span several provider types (e.g. Talisman substrate + EVM).
  const brand = provider ? getWallet(provider)?.title : undefined
  const providers = provider
    ? accounts
        .map((account) => account.provider)
        .filter(
          (type) =>
            type === provider || (!!brand && getWallet(type)?.title === brand),
        )
    : null

  const { rows, total } = groupDepositBalances(
    filterDepositBalancesByProviders(pricedRows, providers),
  )

  return {
    rows,
    total,
    accounts,
    progress: getDiscoveryProgress(Object.values(walletResults), results),
    failed: results.filter((result) => result.isError).length,
  }
}
