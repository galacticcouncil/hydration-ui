import {
  HYDRATION_CHAIN_KEY,
  MultichainBalanceService,
  useStableArray,
} from "@galacticcouncil/utils"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback, useMemo } from "react"
import { isNonNullish } from "remeda"

import { fetchHydrationRegistryAssetAmounts } from "@/api/balances"
import { useCrossChainConfigService, useHydrationAssetId } from "@/api/xcm"
import { PORTFOLIO_CHAINS } from "@/config/portfolio"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

export const useMultichainService = (
  chains: readonly string[] = PORTFOLIO_CHAINS,
) => {
  const configService = useCrossChainConfigService()

  return useMemo(
    () =>
      new MultichainBalanceService({
        configService,
        chains,
      }),
    [configService, chains],
  )
}

export type MultichainValuedBalance = {
  balance: AssetAmount
  /** Hydration registry id, or null when the asset is not on Hydration */
  assetId: string | null
  /** Value in the user's display currency, or null when unpriceable */
  displayValue: string | null
}

export type MultichainBalanceEntry = {
  address: string
  chainKey: string
  balances: AssetAmount[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * One query per address × eligible chain, so each chain section loads, fails and
 * retries on its own. The service's `getBalances` fan-out is intentionally
 * unused here — it would collapse all chains into a single query state.
 *
 * All grouping/shaping lives here; the service stays chain-agnostic.
 */
export const useMultichainPortfolio = (
  addresses: string[],
  chains: readonly string[] = PORTFOLIO_CHAINS,
) => {
  const service = useMultichainService(chains)
  const configService = useCrossChainConfigService()
  const { sdk, isApiLoaded } = useRpcProvider()
  const { getAsset, isToken, isErc20 } = useAssets()
  const stableAddresses = useStableArray(addresses)

  const fetchHydrationBalances = useCallback(
    (address: string) =>
      fetchHydrationRegistryAssetAmounts({
        address,
        sdk,
        getAsset,
        isToken,
        isErc20,
      }),
    [sdk, getAsset, isToken, isErc20],
  )

  const pairs = useMemo(
    () =>
      stableAddresses.flatMap((address) =>
        service
          .getEligibleChains(address)
          .map((chain) => ({ address, chainKey: chain.key })),
      ),
    [service, stableAddresses],
  )

  const results = useQueries({
    queries: pairs.map(({ address, chainKey }) => ({
      queryKey: ["portfolio", "balances", address, chainKey],
      queryFn: () =>
        chainKey === HYDRATION_CHAIN_KEY
          ? fetchHydrationBalances(address)
          : service.getChainBalances(address, chainKey),
      enabled:
        chainKey !== HYDRATION_CHAIN_KEY ||
        (isApiLoaded && !!Object.keys(sdk).length),
      staleTime: 60_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
    })),
  })

  const entries: MultichainBalanceEntry[] = pairs.map((pair, i) => {
    const query = results[i]
    return {
      ...pair,
      balances: query?.data ?? [],
      isLoading: query?.isLoading ?? true,
      isError: query?.isError ?? false,
      refetch: () => void query?.refetch(),
    }
  })

  const getHydrationAssetId = useHydrationAssetId()

  const resolvePortfolioAssetId = (
    balance: AssetAmount,
    chainKey: string,
  ): string | null =>
    chainKey === HYDRATION_CHAIN_KEY && /^\d+$/.test(balance.key)
      ? balance.key
      : getHydrationAssetId(balance, chainKey)

  const assetIds = entries.flatMap((entry) =>
    entry.balances
      .map((balance) => resolvePortfolioAssetId(balance, entry.chainKey))
      .filter(isNonNullish),
  )

  const { getAssetPrice } = useAssetsPrice(assetIds)

  const value = (
    balance: AssetAmount,
    sourceChainKey: string,
  ): MultichainValuedBalance => {
    const assetId = resolvePortfolioAssetId(balance, sourceChainKey)
    const price = assetId ? getAssetPrice(assetId) : null

    return {
      balance,
      assetId,
      // no price => no fiat value at all; never fall back to 0, that would
      // render a held balance as "$0.00"
      displayValue: price?.isValid
        ? Big(price.price)
            .times(toDecimal(balance.amount, balance.decimals))
            .toString()
        : null,
    }
  }

  const byChain = chains.flatMap((chainKey) => {
    const chainEntries = entries.filter((entry) => entry.chainKey === chainKey)
    const chain = configService.chains.get(chainKey)
    if (!chainEntries.length || !chain) return []

    const balances = chainEntries.flatMap((entry) =>
      entry.balances.map((balance) => value(balance, chainKey)),
    )
    const isLoading = chainEntries.some((entry) => entry.isLoading)
    const isError = chainEntries.some((entry) => entry.isError)
    const hasAssets = balances.some(({ balance }) =>
      Big(balance.amount.toString()).gt(0),
    )

    // hide chains with nothing to show; keep errors visible for retry
    if (!isError && !isLoading && !hasAssets) return []

    return [
      {
        chainKey,
        chain,
        balances,
        total: balances
          .reduce(
            (acc, { displayValue }) => acc.plus(displayValue ?? "0"),
            Big(0),
          )
          .toString(),
        isLoading,
        isError,
        refetch: () => chainEntries.forEach((entry) => entry.refetch()),
      },
    ]
  })

  return { entries, byChain }
}
