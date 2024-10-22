import { theme } from "theme"
import {
  Filler,
  SBar,
  SBarContainer,
  SContainer,
  SText,
} from "./LinearProgress.styled"

export type ColorType = keyof typeof theme.colors
export type BarSize = "small" | "medium" | "large"
export type LabelPosition = "start" | "end" | "none"

export type LinearProgressProps = {
  percent: number
  size?: BarSize
  color?: ColorType
  colorEnd?: ColorType
  colorCustom?: string
  withoutLabel?: boolean
  labelPosition?: LabelPosition
  labelColor?: ColorType
  children?: React.ReactNode
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export const LinearProgress = ({
  percent,
  children,
  color = "pink700",
  colorEnd,
  colorCustom,
  labelPosition = "end",
  size = "medium",
  labelColor = "white",
  withoutLabel,
  ...props
}: LinearProgressProps) => {
  const percentage = Math.max(0, Math.min(percent, 100))

  return (
    <SContainer {...props}>
      <SBarContainer size={size}>
        <Filler percentage={percentage}>
          <SBar
            colorStart={color}
            colorEnd={colorEnd}
            colorCustom={colorCustom}
            percentage={percentage}
          />
        </Filler>
      </SBarContainer>
      {!withoutLabel && (
        <SText position={labelPosition} size={size} color={labelColor}>
          {children || `${percent.toFixed(2)}%`}
        </SText>
      )}
    </SContainer>
  )
}
