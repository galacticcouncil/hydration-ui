import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  SContainer,
  SProgressBar,
  SProgressBarFill,
  SProgressBarLabel,
} from "@/components/ProgressBar/ProgressBar.styled"

export type ProgressBarSize = "small" | "large"
export type FillVariant = ""

type Props = {
  readonly value: number
  readonly size: ProgressBarSize
  readonly format?: (percentage: number) => string
}

export const ProgressBar: FC<Props> = ({ value, size, format }) => {
  const { t } = useTranslation()
  const clippedValue = Math.max(0, Math.min(100, value))
  const formattedValue = format?.(value) ?? t("percent", { value })

  return (
    <SContainer size={size}>
      <SProgressBar>
        <SProgressBarFill value={clippedValue} />
      </SProgressBar>
      <SProgressBarLabel>{formattedValue}</SProgressBarLabel>
    </SContainer>
  )
}
