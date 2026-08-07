import {
  HYDRATION_CHAIN_KEY,
  MultichainBalanceService,
  useStableArray,
} from "@galacticcouncil/utils"
import { Asset, AssetAmount } from "@galacticcouncil/xc-core"
import { useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback, useMemo } from "react"
import { isNonNullish } from "remeda"

import { useCrossChainConfigService } from "@/api/xcm"
import { PORTFOLIO_CHAINS } from "@/config/portfolio"
import { useAssetsPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

export const useMultichainService = (
  chains: readonly string[] = PORTFOLIO_CHAINS,
) => {
  const configService = useCrossChainConfigService()

  // ponytail: `chains` is expected to be a module-level constant, so plain
  // identity is a good enough memo key here.
  return useMemo(
    () =>
      new MultichainBalanceService({
        configService,
        chains,
      }),
    [configService, chains],
  )
}

/**
 * Maps an xc asset onto its Hydration registry id, the key every price in
 * `useDisplaySpotPriceStore` is keyed by. `getAssetId` throws for assets that
 * are not registered on Hydration (e.g. a Solana-only token), so it is guarded
 * — an unmapped asset just loses its fiat value, it must not break the section.
 */
export const useHydrationAssetId = () => {
  const configService = useCrossChainConfigService()
  const hydrationChain = configService.chains.get(HYDRATION_CHAIN_KEY)

  return useCallback(
    (asset: Asset): string | null => {
      if (!hydrationChain) return null
      try {
        return hydrationChain.getAssetId(asset).toString()
      } catch {
        return null
      }
    },
    [hydrationChain],
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
  const stableAddresses = useStableArray(addresses)

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
      queryFn: () => service.getChainBalances(address, chainKey),
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

  const assetIds = entries.flatMap((entry) =>
    entry.balances.map(getHydrationAssetId).filter(isNonNullish),
  )

  const { getAssetPrice } = useAssetsPrice(assetIds)

  const value = (balance: AssetAmount): MultichainValuedBalance => {
    const assetId = getHydrationAssetId(balance)
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

    const balances = chainEntries.flatMap((entry) => entry.balances.map(value))

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
        isLoading: chainEntries.some((entry) => entry.isLoading),
        isError: chainEntries.some((entry) => entry.isError),
        refetch: () => chainEntries.forEach((entry) => entry.refetch()),
      },
    ]
  })

  return { entries, byChain }
}
