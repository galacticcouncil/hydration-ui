import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { TAsset } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export type LimitFillStatus = {
  readonly orderRate: string | null
  readonly marketRate: string | null
  readonly distancePct: number | null
  readonly fillable: boolean
  readonly isLoading: boolean
}

type Args = {
  readonly from: TAsset
  readonly to: TAsset
  readonly sellAmount: string | null
  readonly receiveAmount: string | null
}

type QueryArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountIn: string
}

const limitFillQuery = (
  { sdk, isReady }: TProviderContext,
  { assetIn, assetOut, amountIn }: QueryArgs,
) =>
  queryOptions({
    queryKey: ["limitFill", assetIn, assetOut, amountIn],
    queryFn: () =>
      sdk.api.router.getBestSell(Number(assetIn), Number(assetOut), amountIn),
    enabled: isReady && !!assetIn && !!assetOut && Big(amountIn || "0").gt(0),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })

export const useLimitFillStatus = ({
  from,
  to,
  sellAmount,
  receiveAmount,
}: Args): LimitFillStatus => {
  const rpc = useRpcProvider()

  const orderRate =
    sellAmount && receiveAmount && Big(sellAmount).gt(0)
      ? Big(receiveAmount).div(sellAmount)
      : null

  const { data: swap, isLoading } = useQuery(
    limitFillQuery(rpc, {
      assetIn: from.id,
      assetOut: to.id,
      amountIn: sellAmount ?? "0",
    }),
  )

  const rateOf = (trade: typeof swap) => {
    if (!trade) return null
    try {
      const inHuman = Big(trade.amountIn.toString()).div(
        Big(10).pow(from.decimals),
      )
      const outHuman = Big(trade.amountOut.toString()).div(
        Big(10).pow(to.decimals),
      )
      return inHuman.gt(0) ? outHuman.div(inHuman) : null
    } catch {
      return null
    }
  }

  const fillRate = rateOf(swap)

  const fillable = !!orderRate && !!fillRate && fillRate.gte(orderRate)

  const distancePct =
    orderRate && fillRate && fillRate.gt(0)
      ? orderRate.div(fillRate).minus(1).times(100).toNumber()
      : null

  return {
    orderRate: orderRate?.toString() ?? null,
    marketRate: fillRate?.toString() ?? null,
    distancePct,
    fillable,
    isLoading,
  }
}
