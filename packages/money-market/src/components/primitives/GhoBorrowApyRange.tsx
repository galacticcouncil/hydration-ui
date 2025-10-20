import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import { Text } from "@galacticcouncil/ui/components"
import React from "react"
import Skeleton from "react-loading-skeleton"

import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"

type GhoBorrowApyRangeProps = {
  minVal?: number
  maxVal?: number
}

export const GhoBorrowApyRange: React.FC<GhoBorrowApyRangeProps> = ({
  minVal,
  maxVal,
}) => {
  const { formatPercent } = useAppFormatters()
  const { ghoLoadingData, ghoReserveData } = useMoneyMarketData()

  if (ghoLoadingData || !ghoReserveData)
    return <Skeleton width={70} height={24} />

  // Check precision, could be different by small amount but show same
  const lowRangeValue = minVal ?? ghoReserveData.ghoBorrowAPYWithMaxDiscount
  const highRangeValue = maxVal ?? ghoReserveData.ghoVariableBorrowAPY

  // Normalize and compare, round to two decimal places as if they'd be formatted
  const normalizedLowValue = Number((lowRangeValue * 100).toFixed(2))
  const normalizedHighValue = Number((highRangeValue * 100).toFixed(2))
  const isSameDisplayValue = normalizedLowValue === normalizedHighValue

  // Just show one value if they are the same display value after being formatted, otherwise, hyphenate and show both values
  return (
    <Text fw={600}>
      {isSameDisplayValue
        ? formatPercent(+lowRangeValue * 100)
        : `${formatPercent(+lowRangeValue * 100)} - ${formatPercent(+highRangeValue * 100)}`}
    </Text>
  )
}
