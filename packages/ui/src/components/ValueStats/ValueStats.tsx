import { ResponsiveStyleValue } from "@theme-ui/css"
import { FC, ReactNode } from "react"

import {
  SValueStats,
  SValueStatsBottomValue,
  SValueStatsLabel,
  SValueStatsValue,
  SValueStatsValueContainer,
  ValueStatsFont,
  ValueStatsSize,
} from "@/components/ValueStats/ValueStats.styled"
import { useResponsiveValue } from "@/styles/media"

import { Skeleton } from "../Skeleton"

export const ValueStatsLabel = SValueStatsLabel
export const ValueStatsValue = SValueStatsValue
export const ValueStatsBottomValue = SValueStatsBottomValue

type ValueStatsProps = {
  readonly font?: ValueStatsFont
  readonly wrap?: ResponsiveStyleValue<boolean>
  readonly size?: ValueStatsSize
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string
  readonly customValue?: ReactNode
  readonly bottomLabel?: string
  readonly customBottomLabel?: ReactNode
  readonly isLoading?: boolean
  readonly className?: string
}

export const ValueStats: FC<ValueStatsProps> = ({
  font = "primary",
  wrap,
  size,
  label,
  customLabel,
  value,
  customValue,
  bottomLabel,
  customBottomLabel,
  isLoading,
  className,
}) => {
  const shouldWrap = useResponsiveValue(wrap, false)

  return (
    <SValueStats shouldWrap={shouldWrap} size={size} className={className}>
      {customLabel ?? <SValueStatsLabel>{label}</SValueStatsLabel>}
      <SValueStatsValueContainer size={size}>
        {isLoading ? (
          <SValueStatsValue font={font} size={size}>
            <Skeleton width={120} height="100%" />
          </SValueStatsValue>
        ) : (
          (customValue ?? (
            <SValueStatsValue font={font} size={size}>
              {value}
            </SValueStatsValue>
          ))
        )}

        {isLoading && (bottomLabel || customBottomLabel) ? (
          <SValueStatsBottomValue>
            <Skeleton width={120} height="100%" />
          </SValueStatsBottomValue>
        ) : (
          (customBottomLabel ?? (
            <SValueStatsBottomValue>{bottomLabel}</SValueStatsBottomValue>
          ))
        )}
      </SValueStatsValueContainer>
    </SValueStats>
  )
}
