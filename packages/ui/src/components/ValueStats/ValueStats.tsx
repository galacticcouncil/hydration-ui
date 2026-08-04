import { ResponsiveStyleValue } from "@theme-ui/css"
import { FC, ReactNode } from "react"

import {
  SValueStats,
  SValueStatsBottomValue,
  SValueStatsLabel,
  SValueStatsValue,
  SValueStatsValueContainer,
  ValueStatsAlign,
  ValueStatsFont,
  ValueStatsSize,
} from "@/components/ValueStats/ValueStats.styled"
import { useResponsiveValue } from "@/styles/media"

import { Skeleton } from "../Skeleton"

export const ValueStatsLabel = SValueStatsLabel
export const ValueStatsValue = SValueStatsValue
export const ValueStatsBottomValue = SValueStatsBottomValue

export type ValueStatsProps = {
  readonly font?: ValueStatsFont
  readonly wrap?: ResponsiveStyleValue<boolean>
  readonly size?: ValueStatsSize
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string
  readonly customValue?: ReactNode
  readonly bottomLabel?: string
  readonly customBottomLabel?: ReactNode
  readonly floatingBottomLabel?: boolean
  readonly align?: ValueStatsAlign
  readonly isLoading?: boolean
  readonly className?: string
  readonly containerClassName?: string
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
  floatingBottomLabel,
  align = "left",
  isLoading,
  className,
  containerClassName,
}) => {
  const shouldWrap = useResponsiveValue(wrap, false)

  const renderBottomValues = () => {
    if (isLoading && (bottomLabel || customBottomLabel)) {
      return (
        <SValueStatsBottomValue isFloating={floatingBottomLabel} align={align}>
          <Skeleton width={120} height="100%" />
        </SValueStatsBottomValue>
      )
    }

    if (customBottomLabel) {
      return customBottomLabel
    }

    if (bottomLabel) {
      return (
        <SValueStatsBottomValue isFloating={floatingBottomLabel} align={align}>
          {bottomLabel}
        </SValueStatsBottomValue>
      )
    }

    return null
  }

  return (
    <SValueStats
      shouldWrap={shouldWrap}
      size={size}
      align={align}
      className={className}
    >
      {customLabel ?? <SValueStatsLabel>{label}</SValueStatsLabel>}
      <SValueStatsValueContainer size={size} className={containerClassName}>
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

        {renderBottomValues()}
      </SValueStatsValueContainer>
    </SValueStats>
  )
}
