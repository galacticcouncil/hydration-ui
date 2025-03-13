import { FC, ReactNode } from "react"

import {
  HeaderInfoSize,
  SHeaderInfo,
  SHeaderInfoBottomLabel,
  SHeaderInfoLabel,
  SHeaderInfoValue,
} from "@/components/HeaderInfo/HeaderInfo.styled"

export const HeaderInfoLabel = SHeaderInfoLabel
export const HeaderInfoValue = SHeaderInfoValue
export const HeaderInfoBottomLabel = SHeaderInfoBottomLabel
type HeaderInfoProps = {
  readonly size?: HeaderInfoSize
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string
  readonly customValue?: ReactNode
  readonly bottomLabel?: string
  readonly customBottomLabel?: ReactNode
}

export const HeaderInfo: FC<HeaderInfoProps> = ({
  size,
  label,
  customLabel,
  value,
  customValue,
  bottomLabel,
  customBottomLabel,
}) => {
  return (
    <SHeaderInfo size={size}>
      {customLabel ?? <SHeaderInfoLabel>{label}</SHeaderInfoLabel>}
      {customValue ?? <SHeaderInfoValue size={size}>{value}</SHeaderInfoValue>}
      {customBottomLabel ?? (
        <SHeaderInfoBottomLabel>{bottomLabel}</SHeaderInfoBottomLabel>
      )}
    </SHeaderInfo>
  )
}
