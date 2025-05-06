import { ThemeUICSSObject } from "@theme-ui/css"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import {
  SContainer,
  SProgressBar,
  SProgressBarFill,
  SProgressBarLabel,
} from "@/components/ProgressBar/ProgressBar.styled"

export type ProgressBarSize = "small" | "medium" | "large"
export type ProgressBarOrientation = "horizontal" | "vertical"

type Props = {
  readonly value: number
  readonly customLabel?: string | ReactNode
  readonly size?: ProgressBarSize
  readonly format?: (percentage: number) => string
  readonly orientation?: ProgressBarOrientation
  readonly hideLabel?: boolean
  readonly className?: string
  readonly color?: ThemeUICSSObject["color"]
}

export const ProgressBar: FC<Props> = ({
  value,
  size = "medium",
  customLabel,
  format,
  orientation = "horizontal",
  hideLabel,
  className,
  color,
}) => {
  const { t } = useTranslation()
  const clippedValue = Math.max(0, Math.min(100, value))
  const formattedValue =
    format?.(clippedValue) ?? t("percent", { clippedValue })

  return (
    <SContainer size={size} orientation={orientation} className={className}>
      <SProgressBar>
        <SProgressBarFill
          value={clippedValue}
          sx={{ backgroundColor: color }}
        />
      </SProgressBar>
      {!hideLabel && (
        <SProgressBarLabel>{customLabel ?? formattedValue}</SProgressBarLabel>
      )}
    </SContainer>
  )
}
