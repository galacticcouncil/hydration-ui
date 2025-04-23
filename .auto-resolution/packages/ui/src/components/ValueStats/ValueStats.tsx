import { FC, ReactNode } from "react"

import {
  SValueStats,
  SValueStatsBottomValue,
  SValueStatsLabel,
  SValueStatsValue,
  SValueStatsValueContainer,
  ValueStatsSize,
} from "@/components/ValueStats/ValueStats.styled"

export const ValueStatsLabel = SValueStatsLabel
export const ValueStatsValue = SValueStatsValue
export const ValueStatsBottomValue = SValueStatsBottomValue

type ValueStatsProps = {
  readonly alwaysWrap?: boolean
  readonly size?: ValueStatsSize
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string
  readonly customValue?: ReactNode
  readonly bottomLabel?: string
  readonly customBottomLabel?: ReactNode
}

export const ValueStats: FC<ValueStatsProps> = ({
  alwaysWrap,
  size,
  label,
  customLabel,
  value,
  customValue,
  bottomLabel,
  customBottomLabel,
}) => {
  return (
    <SValueStats alwaysWrap={alwaysWrap} size={size}>
      {customLabel ?? <SValueStatsLabel>{label}</SValueStatsLabel>}
      <SValueStatsValueContainer size={size}>
        {customValue ?? (
          <SValueStatsValue size={size}>{value}</SValueStatsValue>
        )}
        {customBottomLabel ?? (
          <SValueStatsBottomValue>{bottomLabel}</SValueStatsBottomValue>
        )}
      </SValueStatsValueContainer>
    </SValueStats>
  )
}
