import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import {
  ProgressBarVariant,
  SContainer,
  SProgressBar,
  SProgressBarFill,
  SProgressBarLabel,
} from "@/components/ProgressBar/ProgressBar.styled"

export type ProgressBarSize = "small" | "medium" | "large"
export type ProgressBarOrientation = "horizontal" | "vertical"

export type ProgressBarProps = {
  readonly value: number
  readonly customLabel?: string | ReactNode
  readonly size?: ProgressBarSize
  readonly format?: (percentage: number) => string
  readonly orientation?: ProgressBarOrientation
  readonly hideLabel?: boolean
  readonly className?: string
  readonly variant?: ProgressBarVariant
  readonly animated?: boolean
}

export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  size = "medium",
  customLabel,
  format,
  orientation = "horizontal",
  hideLabel,
  className,
  variant = "accent",
  animated = false,
}) => {
  const { t } = useTranslation("common")
  const clippedValue = Math.max(0, Math.min(100, value))
  const formattedValue =
    format?.(clippedValue) ?? t("percent", { value: clippedValue })

  return (
    <SContainer size={size} orientation={orientation} className={className}>
      <SProgressBar>
        <SProgressBarFill
          value={clippedValue}
          variant={variant}
          animated={animated}
        />
      </SProgressBar>
      {!hideLabel && (
        <SProgressBarLabel>{customLabel ?? formattedValue}</SProgressBarLabel>
      )}
    </SContainer>
  )
}
