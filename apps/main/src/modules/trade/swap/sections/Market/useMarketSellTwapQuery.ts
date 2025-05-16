import { PoolType } from "@galacticcouncil/sdk-next/build/types/pool"
import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useQuery } from "@tanstack/react-query"

import { spotPrice } from "@/api/spotPrice"
import { bestSellQuery } from "@/api/trade"
import { useMarketPartialFeeQuery } from "@/modules/trade/swap/sections/Market/useMarketPartialFeeQuery"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  exchangeNative,
  MIN_NATIVE_AMOUNT,
  NATIVE_ASSET_DECIMALS,
  NATIVE_ASSET_ID,
  QUERY_KEY_BLOCK_PREFIX,
} from "@/utils/consts"
import { scale } from "@/utils/formatting"

// TODO get block time from rpc, its different
// PARACHAIN_BLOCK_TIME,
const blockTime = 13765

export const useMarketSellTwapQuery = (
  swap: Trade | undefined,
  sellAsset: TAsset | null,
  buyAsset: TAsset | null,
  sellAmount: string,
) => {
  const rpc = useRpcProvider()
  const { twapApi } = rpc
  const { slippageTwap } = useTradeSettings()

  const pools = swap?.swaps.map((swap) => swap.pool) ?? []
  const notSupportedRoute =
    pools.includes("LBP" as PoolType) || pools.includes("XYK" as PoolType)
  const isTwapAllowed = !notSupportedRoute

  const showTwap = isTwapAllowed && !!swap?.swaps.length

  const { data: price, isLoading: priceLoading } = useQuery(
    spotPrice(rpc, sellAsset?.id ?? "", NATIVE_ASSET_ID),
  )

  const swapQueryKey = bestSellQuery(rpc, {
    assetIn: sellAsset?.id ?? "",
    assetOut: buyAsset?.id ?? "",
    amountIn: sellAmount,
  }).queryKey

  const { data: partialFee, isLoading: partialFeeLoading } =
    useMarketPartialFeeQuery(swapQueryKey, sellAsset, swap)

  const queryResult = useQuery({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twap",
      swapQueryKey,
      partialFee?.toString(),
      blockTime,
      slippageTwap,
    ],
    queryFn: async () => {
      const txFee = exchangeNative(
        BigInt(scale(price?.spotPrice || "0", NATIVE_ASSET_DECIMALS)),
        sellAsset,
        partialFee ?? 0n,
      )

      const amountInMin = exchangeNative(
        BigInt(scale(price?.spotPrice || "0", NATIVE_ASSET_DECIMALS)),
        sellAsset,
        BigInt(MIN_NATIVE_AMOUNT),
      )

      return sellAsset && buyAsset && swap
        ? twapApi.getSellTwap(
            amountInMin,
            sellAsset,
            buyAsset,
            swap,
            txFee,
            blockTime,
            slippageTwap,
          )
        : undefined
    },
    enabled: showTwap && !priceLoading && !partialFeeLoading,
  })

  return {
    ...queryResult,
    isLoading: queryResult.isLoading || priceLoading || partialFeeLoading,
    showTwap,
  }
}
