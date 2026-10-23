import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { depositBalancesQuery } from "@/api/deposit"
import {
  useCrossChainConfigService,
  useCrossChainWallet,
  useHydrationAssetId,
} from "@/api/xcm"
import {
  filterDepositBalancesByProviders,
  getDepositSources,
  groupDepositBalances,
} from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XCM_CHAINS } from "@/modules/xcm/transfer/utils/chain"
import { useAssetsPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

type DepositDiscoveryOptions = { provider?: WalletProviderType | null }

export const useDepositDiscovery = ({
  provider,
}: DepositDiscoveryOptions = {}) => {
  const accounts = useDepositAccounts({ signersOnly: true })
  const wallet = useCrossChainWallet()
  const config = useCrossChainConfigService()
  const { sourceChainAssetPairs } = useXcmProvider()
  const sources = useMemo(
    () =>
      getDepositSources(
        accounts,
        XCM_CHAINS.filter((chain) => chain.key !== HYDRATION_CHAIN_KEY).map(
          (chain) => ({
            chain,
            assets:
              sourceChainAssetPairs.find((pair) => pair.chain.key === chain.key)
                ?.assets ?? [],
            routes: (config.routes.get(chain.key)?.getRoutes() ?? []).filter(
              (route) => route.destination.chain.key === HYDRATION_CHAIN_KEY,
            ),
            isTagSelect: false,
          }),
        ),
      ),
    [accounts, config, sourceChainAssetPairs],
  )
  const results = useQueries({
    queries: sources.map((source) =>
      depositBalancesQuery(wallet, source.chain, source.account.rawAddress),
    ),
  })
  const getAssetId = useHydrationAssetId()
  const rawRows = sources.flatMap((source, index) =>
    (results[index]?.data ?? [])
      .filter((balance) => balance.amount > 0n)
      .map((balance) => ({
        key: `${source.key}:${balance.key}`,
        source,
        balance,
      })),
  )
  const ids = rawRows
    .map((row) => getAssetId(row.balance, row.source.chain.key))
    .filter((id): id is string => !!id)
  const { getAssetPrice, isLoading: pricesLoading } = useAssetsPrice(ids)
  const selectedWalletName = provider ? getWallet(provider)?.title : undefined
  const selectedProviders = provider
    ? accounts
        .filter(
          (account) =>
            account.provider === provider ||
            (selectedWalletName &&
              getWallet(account.provider)?.title === selectedWalletName),
        )
        .map((account) => account.provider)
    : null
  const rows = filterDepositBalancesByProviders(
    rawRows.map((row) => {
      const id = getAssetId(row.balance, row.source.chain.key)
      const price = getAssetPrice(id ?? "")
      return {
        ...row,
        value: price.isValid
          ? Big(toDecimal(row.balance.amount, row.balance.decimals))
              .times(price.price)
              .toString()
          : undefined,
      }
    }),
    selectedProviders,
  )
  const summary = groupDepositBalances(rows)
  const fundedChains = [
    ...new Map(
      rows.map((row) => [row.source.chain.key, row.source.chain]),
    ).values(),
  ]
  return {
    ...summary,
    sources,
    accounts,
    fundedChains,
    scanning: results.some((result) => result.isPending || result.isFetching),
    pricesLoading,
    failed: results.filter((result) => result.isError).length,
    count: sources.length,
  }
}
