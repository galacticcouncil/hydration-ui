import { formatNumber } from "@galacticcouncil/utils"
import { IChartApi } from "lightweight-charts"
import { FC, useEffect, useState } from "react"

import { Box } from "@/components"
import {
  SPriceMarkerAnchor,
  SPriceMarkerLine,
  SPriceMarkerTag,
} from "@/components/TradingViewChart/components/PriceMarkers.styled"
import { TradingViewChartSeries } from "@/components/TradingViewChart/utils"

type PriceMarkersProps = {
  priceLines: Array<number>
  seriesApi: TradingViewChartSeries
  chartApi: IChartApi
  label?: string
}

export const PriceMarkers: FC<PriceMarkersProps> = ({
  priceLines,
  seriesApi,
  chartApi,
  label,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [positions, setPositions] = useState<
    ReadonlyArray<{ readonly top: number; readonly price: number }>
  >([])

  useEffect(() => {
    const updatePositions = () => {
      const positions = priceLines
        .map((price) => {
          const priceY = seriesApi.priceToCoordinate(price)

          if (priceY === null) {
            return null
          }

          return {
            top: priceY,
            price,
          }
        })
        .filter((position) => !!position)

      setPositions(positions)
    }

    const timeout = setTimeout(updatePositions, 100)

    chartApi.timeScale().subscribeVisibleLogicalRangeChange(updatePositions)

    return () => {
      clearTimeout(timeout)
      chartApi.timeScale().unsubscribeVisibleLogicalRangeChange(updatePositions)
    }
  }, [priceLines, seriesApi, chartApi])

  return (
    <>
      {positions.map((pos, index) => (
        <Box key={index}>
          {hoveredIndex === index && (
            <SPriceMarkerLine style={{ top: pos.top }} />
          )}
          <SPriceMarkerAnchor
            style={{ top: pos.top }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <SPriceMarkerTag>
              {label && <span>{label}</span>}
              <span>{formatNumber(pos.price)}</span>
            </SPriceMarkerTag>
          </SPriceMarkerAnchor>
        </Box>
      ))}
    </>
  )
}
