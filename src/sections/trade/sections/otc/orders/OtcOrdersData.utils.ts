import { useMemo } from "react"
import { useOrdersData, useOrdersState, getOrderStateValue } from "api/otc"
import BN from "bignumber.js"
import { calculateDiffToRef } from "@galacticcouncil/sdk"
import { isNotNil } from "utils/helpers"
import { useAssetsPrice } from "state/displayPrice"

export const useOrdersTableData = () => {
  const treasuryAddr = import.meta.env.VITE_TRSRY_ADDR
  const orders = useOrdersData()
  const orderIds = orders.data?.map((order) => order.id)
  const ordersState = useOrdersState(orderIds || [])

  const assets = orders.data?.reduce(
    (acc, order) => {
      ;[order.assetIn, order.assetOut].forEach((asset) => {
        if (
          asset &&
          asset.id &&
          asset.name &&
          !acc.find((a) => a.id === asset.id)
        ) {
          acc.push({ id: asset.id, name: asset.name, symbol: asset.symbol })
        }
      })
      return acc
    },
    [] as { id: string; symbol: string; name: string }[],
  )

  const { getAssetPrice, isLoading: isPriceLaoding } = useAssetsPrice(
    assets?.map((asset) => asset.id) ?? [],
  )

  const queries = [orders, ...ordersState]
  const isLoading = queries.some((q) => q.isLoading) || isPriceLaoding
  const isInitialLoading =
    queries.some((q) => q.isInitialLoading) || isPriceLaoding

  const data = useMemo(() => {
    if (!orders.data || isInitialLoading) return []
    return orders.data
      .map((order) => {
        const assetInValid = order.assetIn?.isExternal
          ? !!order.assetIn?.name
          : true
        const assetOutValid = order.assetOut?.isExternal
          ? !!order.assetOut?.name
          : true

        if (
          !assetInValid ||
          !assetOutValid ||
          !order.assetIn ||
          !order.assetOut
        )
          return null

        const orderState = ordersState.find(
          (state) => state.data?.orderId === parseInt(order.id),
        )
        const orderStateValue = getOrderStateValue(orderState?.data)
        const amountInDp: number = order.assetIn?.decimals ?? 12
        const amountIn: BN = order.amountIn!.shiftedBy(-1 * amountInDp)
        const amountInInitial: string | undefined = orderStateValue?.amountIn
        const amountOutDp: number = order.assetOut?.decimals ?? 12
        const amountOut: BN = order.amountOut!.shiftedBy(-1 * amountOutDp)
        const amountOutInitial: string | undefined = orderStateValue?.amountOut

        const priceIn = getAssetPrice(order.assetIn.id).price
        const priceOut = getAssetPrice(order.assetOut.id).price

        const valueOfAssetIn = amountIn.multipliedBy(priceIn)
        const orderPrice = valueOfAssetIn.div(amountOut || 0)

        const marketPricePercentage = calculateDiffToRef(
          BN(priceOut),
          orderPrice,
        ).toNumber()

        return {
          id: order.id,
          owner: order.owner,
          offer: {
            initial:
              amountOutInitial &&
              new BN(amountOutInitial).shiftedBy(-1 * amountOutDp),
            amount: amountOut,
            asset: order.assetOut?.id,
            name: order.assetOut?.name,
            symbol: order.assetOut?.symbol,
          },
          accepting: {
            initial:
              amountInInitial &&
              new BN(amountInInitial).shiftedBy(-1 * amountInDp),
            amount: amountIn,
            asset: order.assetIn?.id,
            name: order.assetIn?.name,
            symbol: order.assetIn?.symbol,
          },
          price: amountIn.div(amountOut),
          orderPrice: orderPrice,
          marketPrice: BN(priceOut),
          marketPricePercentage: marketPricePercentage,
          partiallyFillable: order.partiallyFillable,
          pol: order.owner === treasuryAddr,
        } as OrderTableData
      })
      .filter(isNotNil)
  }, [orders.data, ordersState, treasuryAddr, isInitialLoading, getAssetPrice])

  return {
    data,
    isLoading,
    isInitialLoading,
  }
}

export type OrderTableData = {
  id: string
  owner: string
  offer: OfferingPair
  accepting: OfferingPair
  price: BN
  orderPrice: BN
  marketPrice: BN
  marketPricePercentage: number
  filled: string
  partiallyFillable: boolean
  pol: boolean
}

export type OfferingPair = {
  initial: BN | undefined
  amount: BN
  asset: string
  name: string
  symbol: string
}
