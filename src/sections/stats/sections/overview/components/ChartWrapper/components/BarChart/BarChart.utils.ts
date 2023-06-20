import { useAssetMetaList } from "api/assetMeta"
import { useOmnipoolAssets } from "api/omnipool"
import { useTradeVolumes } from "api/volume"
import BN from "bignumber.js"
import { isAfter, isBefore, subHours } from "date-fns"
import { useMemo } from "react"
import { BN_10 } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"

export const useAssetsVolumeChart = () => {
  const omnipoolAssets = useOmnipoolAssets()
  const assetIds = omnipoolAssets.data?.map((asset) => asset.id) ?? []
  const volumes = useTradeVolumes(assetIds)
  const assetMetas = useAssetMetaList(assetIds)
  const displayPrices = useDisplayPrices(assetIds)

  const currentDate = new Date()

  const dates = [...Array(24)]
    .map((_, index) => {
      const date = subHours(currentDate, index)
      return {
        date,
        hours: `${String(date.getHours()).padStart(2, "0")}:00`,
        displayValue: 0,
      }
    })
    .reverse()

  const queries = [displayPrices, ...volumes]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (isLoading || !volumes.length) return []

    return volumes.reduce((outerAcc, volume) => {
      if (!volume.data?.events) return outerAcc
      volume.data.events.forEach((trade) => {
        if (trade.name === "OTC.Placed") return outerAcc

        const assetIn = trade.args.assetIn.toString()
        const amountIn = new BN(trade.args.amountIn)
        const timeStamp = trade.block.timestamp

        const assetMeta = assetMetas.data?.find((meta) => meta.id === assetIn)

        const spotPrice = displayPrices.data?.find(
          (spotPrice) => spotPrice?.tokenIn === assetIn,
        )

        const assetScale = amountIn.dividedBy(
          BN_10.pow(assetMeta?.decimals.toNumber() ?? 12),
        )

        const displayValue = assetScale
          .multipliedBy(spotPrice?.spotPrice ?? 1)
          .div(2)

        const datesResult = outerAcc.map((el) => {
          // rework calculations when API is ready, it is not correct
          const isWithinRange =
            isBefore(new Date(timeStamp), el.date) &&
            isAfter(new Date(timeStamp), subHours(el.date, 1))

          if (isWithinRange) {
            return {
              ...el,
              displayValue: el.displayValue + displayValue.toNumber(),
            }
          }

          return el
        })

        outerAcc = datesResult
      })

      return outerAcc
    }, dates)
  }, [isLoading, volumes, dates, assetMetas.data, displayPrices])

  return { data, isLoading }
}
