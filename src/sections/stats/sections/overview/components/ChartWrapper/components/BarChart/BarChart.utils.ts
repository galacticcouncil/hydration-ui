import { useAssetMetaList } from "api/assetMeta"
import { useOmnipoolAssets } from "api/omnipool"
import { useSpotPrices } from "api/spotPrice"
import { useTradeVolumes } from "api/volume"
import BN from "bignumber.js"
import { isAfter, isBefore, subHours } from "date-fns"
import { useMemo } from "react"
import { BN_10, STABLECOIN_ID } from "utils/constants"

export const useAssetsVolumeChart = () => {
  const omnipoolAssets = useOmnipoolAssets()
  const assetIds = omnipoolAssets.data?.map((asset) => asset.id) ?? []
  const volumes = useTradeVolumes(assetIds)
  const assetMetas = useAssetMetaList(assetIds)
  const spotPrices = useSpotPrices(assetIds, STABLECOIN_ID)

  const currentDate = new Date()

  const dates = [...Array(24)]
    .map((_, index) => {
      const date = subHours(currentDate, index)
      return {
        date,
        hours: `${String(date.getHours()).padStart(2, "0")}:00`,
        dollarValue: 0,
      }
    })
    .reverse()

  const queries = [...spotPrices, ...volumes]
  const isLoading = queries.some((q) => q.isInitialLoading)

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

        const spotPrice = spotPrices.find(
          (spotPrice) => spotPrice?.data?.tokenIn === assetIn,
        )

        const assetScale = amountIn.dividedBy(
          BN_10.pow(assetMeta?.decimals.toNumber() ?? 12),
        )

        const dollarValue = assetScale
          .multipliedBy(spotPrice?.data?.spotPrice ?? 1)
          .div(2)

        const datesResult = outerAcc.map((el) => {
          // rework calculations when API is ready, it is not correct
          const isWithinRange =
            isBefore(new Date(timeStamp), el.date) &&
            isAfter(new Date(timeStamp), subHours(el.date, 1))

          if (isWithinRange) {
            return {
              ...el,
              dollarValue: el.dollarValue + dollarValue.toNumber(),
            }
          }

          return el
        })

        outerAcc = datesResult
      })

      return outerAcc
    }, dates)
  }, [isLoading, volumes, dates, assetMetas.data, spotPrices])

  return { data, isLoading }
}
