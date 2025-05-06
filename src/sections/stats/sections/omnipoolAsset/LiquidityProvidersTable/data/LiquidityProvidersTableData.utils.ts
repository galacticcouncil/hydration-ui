import { useAssets } from "providers/assets"
import { useAllLiquidityPositions, useOmnipoolDataObserver } from "api/omnipool"
import BN from "bignumber.js"
import { useMemo } from "react"
import { BN_NAN } from "utils/constants"
import { isNotNil } from "utils/helpers"
import { useLiquidityPositionData } from "utils/omnipool"
import { groupBy } from "utils/rx"
import { useAssetsPrice } from "state/displayPrice"

const rowLimit = 10

export const useLiquidityProvidersTableData = (assetId: string) => {
  const { getAsset } = useAssets()

  const positions = useAllLiquidityPositions()

  const omnipoolAssets = useOmnipoolDataObserver()
  const omnipoolAsset = omnipoolAssets.dataMap?.get(assetId)

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    omnipoolAsset?.id ? [omnipoolAsset.id] : [],
  )

  const { getData } = useLiquidityPositionData([assetId])

  const queries = [positions, omnipoolAssets]

  const isLoading = queries.some((q) => q.isLoading) || isPriceLoading

  const data = useMemo(() => {
    const meta = getAsset(assetId)

    if (!positions.data || !omnipoolAsset || !meta) {
      return []
    }

    const omnipoolTvlPrice = BN(omnipoolAsset.balance)
      .times(getAssetPrice(omnipoolAsset.id).price)
      .shiftedBy(-meta.decimals)

    const data = positions.data

      // filter positions by assetId
      .filter((position) => position.assetId === assetId)
      .map((position) => {
        const data = getData({ ...position, id: "" })

        if (data) {
          const {
            lrnaShifted,
            valueShifted,
            valueDisplay,
            valueDisplayWithoutLrna,
            totalValueShifted,
          } = data

          return {
            assetId: meta.id,
            symbol: meta.symbol,
            account: position.owner,
            sharePercent: omnipoolTvlPrice.isNaN()
              ? BN_NAN
              : valueDisplayWithoutLrna.div(omnipoolTvlPrice).times(100),
            lrna: lrnaShifted,
            value: valueShifted,
            valueDisplay,
            totalValueShifted,
          }
        }

        return undefined
      })
      .filter(isNotNil)

    // group by account
    const groupedData = groupBy(data, (p) => p.account.toString())

    // sum up values for each account
    const summedUpData = Object.values(groupedData).map((positions) =>
      positions.reduce(
        (prev, curr) => {
          const lrna = prev.lrna.plus(curr.lrna)
          const value = prev.value.plus(curr.value)
          const valueDisplay = prev.valueDisplay.plus(curr.valueDisplay)
          const sharePercent = prev.sharePercent.plus(curr.sharePercent)
          const totalValueShifted = prev.totalValueShifted.plus(
            curr.totalValueShifted,
          )

          return {
            ...prev,
            ...curr,
            lrna,
            value,
            valueDisplay,
            sharePercent,
            totalValueShifted,
          }
        },
        {
          assetId: "",
          symbol: "",
          account: "",
          lrna: BN(0),
          value: BN(0),
          valueDisplay: BN(0),
          sharePercent: BN(0),
          totalValueShifted: BN(0),
        },
      ),
    )

    // sort by USD value
    const sortedData = [...summedUpData].sort((a, b) => {
      return b.valueDisplay.minus(a.valueDisplay).toNumber()
    })

    return sortedData.slice(0, rowLimit)
  }, [assetId, getAsset, getData, omnipoolAsset, positions.data, getAssetPrice])

  return { isLoading, data }
}

export type TLiquidityProvidersTableData = ReturnType<
  typeof useLiquidityProvidersTableData
>["data"]
