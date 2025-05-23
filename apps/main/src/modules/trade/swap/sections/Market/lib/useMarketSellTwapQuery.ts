import { PoolType } from "@galacticcouncil/sdk-next/build/types/pool"
import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { Binary } from "polkadot-api"

import { paymentInfoQuery } from "@/api/paymentInfo"
import { spotPrice } from "@/api/spotPrice"
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

export const useMarketSellTwapQuery = (
  swap: Trade | undefined,
  swapTx: Binary | undefined | null,
  swapKey: string[],
  sellAsset: TAsset | null,
  buyAsset: TAsset | null,
) => {
  const rpc = useRpcProvider()
  const { twapApi } = rpc

  const { account } = useAccount()
  const accountAddress = account?.address ?? ""

  const { slippageTwap } = useTradeSettings()

  const pools = swap?.swaps.map((swap) => swap.pool) ?? []
  const notSupportedRoute =
    pools.includes("LBP" as PoolType) || pools.includes("XYK" as PoolType)
  const isTwapAllowed = !notSupportedRoute

  const showTwap = isTwapAllowed && !!swap?.swaps.length

  const { data: price, isLoading: priceLoading } = useQuery(
    spotPrice(rpc, sellAsset?.id ?? "", NATIVE_ASSET_ID),
  )

  const { data: paymentInfo, isLoading: paymentInfoLoading } = useQuery(
    paymentInfoQuery(rpc, swapTx, accountAddress),
  )

  const { data: blockTime } = useQuery({
    queryKey: ["blockTime"],
    queryFn: () => rpc.timeApi.getBlockTime(),
  })

  const queryResult = useQuery({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twap",
      swapKey,
      price?.spotPrice,
      paymentInfo?.partial_fee.toString(),
      blockTime,
      slippageTwap,
    ],
    queryFn: async () => {
      const txFee = exchangeNative(
        BigInt(scale(price?.spotPrice || "0", NATIVE_ASSET_DECIMALS)),
        sellAsset,
        paymentInfo?.partial_fee ?? 0n,
      )

      const amountInMin = exchangeNative(
        BigInt(scale(price?.spotPrice || "0", NATIVE_ASSET_DECIMALS)),
        sellAsset,
        BigInt(MIN_NATIVE_AMOUNT),
      )

      return sellAsset && buyAsset && swap && blockTime
        ? twapApi.getSellTwap(
            amountInMin,
            sellAsset,
            buyAsset,
            swap,
            txFee,
            blockTime,
            slippageTwap,
          )
        : null
    },
    enabled:
      showTwap &&
      !!blockTime &&
      !!swap &&
      !!sellAsset &&
      !!buyAsset &&
      !!paymentInfo &&
      !!price,
  })

  return {
    ...queryResult,
    isLoading: queryResult.isLoading || priceLoading || paymentInfoLoading,
    showTwap,
  }
}
