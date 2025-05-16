import { FC, ReactNode } from "react"

import {
  SValueStats,
  SValueStatsBottomValue,
  SValueStatsLabel,
  SValueStatsValue,
  SValueStatsValueContainer,
  ValueStatsSize,
} from "@/components/ValueStats/ValueStats.styled"
import { ThemeFont } from "@/theme"

import { Skeleton } from "../Skeleton"

export const ValueStatsLabel = SValueStatsLabel
export const ValueStatsValue = SValueStatsValue
export const ValueStatsBottomValue = SValueStatsBottomValue

type ValueStatsProps = {
  readonly font?: ThemeFont
  readonly alwaysWrap?: boolean
  readonly size?: ValueStatsSize
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string
  readonly customValue?: ReactNode
  readonly bottomLabel?: string
  readonly customBottomLabel?: ReactNode
  readonly isLoading?: boolean
}

export const ValueStats: FC<ValueStatsProps> = ({
  font = "primary",
  alwaysWrap,
  size,
  label,
  customLabel,
  value,
  customValue,
  bottomLabel,
  customBottomLabel,
  isLoading,
}) => {
  return (
    <SValueStats alwaysWrap={alwaysWrap} size={size}>
      {customLabel ?? <SValueStatsLabel>{label}</SValueStatsLabel>}
      <SValueStatsValueContainer size={size}>
        {customValue ?? (
          <SValueStatsValue font={font} size={size}>
            {isLoading ? <Skeleton width={120} height="100%" /> : value}
          </SValueStatsValue>
        )}
        {customBottomLabel ?? (
          <SValueStatsBottomValue>
            {isLoading && bottomLabel ? (
              <Skeleton width="100%" height="100%" />
            ) : (
              bottomLabel
            )}
          </SValueStatsBottomValue>
        )}
      </SValueStatsValueContainer>
    </SValueStats>
  )
}
