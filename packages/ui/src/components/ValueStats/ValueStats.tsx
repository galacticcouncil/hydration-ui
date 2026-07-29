import { ResponsiveStyleValue } from "@theme-ui/css"
import { FC, ReactNode } from "react"

import { Flex } from "@/components/Flex"
import { Tooltip } from "@/components/Tooltip"
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
  readonly floatingBottomLabel?: boolean
  readonly tooltip?: ReactNode
  readonly isLoading?: boolean
  readonly className?: string
  readonly containerClassName?: string
  readonly skeletonWidth?: number
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
  tooltip,
  isLoading,
  className,
  containerClassName,
  skeletonWidth = 120,
}) => {
  const shouldWrap = useResponsiveValue(wrap, false)

  const renderBottomValues = () => {
    if (isLoading && (bottomLabel || customBottomLabel)) {
      return (
        <SValueStatsBottomValue isFloating={floatingBottomLabel}>
          <Skeleton width={skeletonWidth} height="100%" />
        </SValueStatsBottomValue>
      )
    }

    if (customBottomLabel) {
      return customBottomLabel
    }

    if (bottomLabel) {
      return (
        <SValueStatsBottomValue isFloating={floatingBottomLabel}>
          {bottomLabel}
        </SValueStatsBottomValue>
      )
    }

    return null
  }

  const labelContent =
    customLabel ??
    (tooltip ? (
      <Flex align="center" gap="s">
        <SValueStatsLabel>{label}</SValueStatsLabel>
        <Tooltip text={tooltip} asChild />
      </Flex>
    ) : (
      <SValueStatsLabel>{label}</SValueStatsLabel>
    ))

  return (
    <SValueStats shouldWrap={shouldWrap} size={size} className={className}>
      {labelContent}
      <SValueStatsValueContainer size={size} className={containerClassName}>
        {isLoading ? (
          <SValueStatsValue font={font} size={size}>
            <Skeleton width={skeletonWidth} height="100%" />
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
