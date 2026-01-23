import { formatNumber } from "@galacticcouncil/utils"
import { FC, useEffect, useState } from "react"

import { Box } from "@/components"
import {
  SPriceMarkerLine,
  SPriceMarkerTag,
} from "@/components/TradingViewChart/components/PriceMarkers.styled"
import { TradingViewChartSeries } from "@/components/TradingViewChart/utils"

type PriceMarkersProps = {
  priceLines: Array<number>
  seriesApi: TradingViewChartSeries
}

export const PriceMarkers: FC<PriceMarkersProps> = ({
  priceLines,
  seriesApi,
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

    return () => {
      clearTimeout(timeout)
    }
  }, [priceLines, seriesApi])

  return (
    <>
      {positions.map((pos, index) => (
        <Box key={index}>
          {hoveredIndex === index && (
            <SPriceMarkerLine
              sx={{
                top: pos.top,
              }}
            />
          )}
          <SPriceMarkerTag
            sx={{ top: pos.top }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {formatNumber(pos.price)}
          </SPriceMarkerTag>
        </Box>
      ))}
    </>
  )
}
