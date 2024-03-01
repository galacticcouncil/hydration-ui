import { theme } from "theme"
import { SBar, SBarContainer, SContainer, SText } from "./LinearProgress.styled"

export type ColorType = keyof typeof theme.colors
export type BarSize = "small" | "medium" | "large"
export type LabelPosition = "start" | "end" | "none"

export type LinearProgressProps = {
  percent: number
  size?: BarSize
  color?: ColorType
  colorEnd?: ColorType
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
  labelPosition = "end",
  size = "medium",
  labelColor = "white",
  ...props
}: LinearProgressProps) => {
  return (
    <SContainer {...props}>
      <SBarContainer size={size}>
        <SBar
          colorStart={color}
          colorEnd={colorEnd}
          sx={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
        />
      </SBarContainer>
      <SText position={labelPosition} size={size} color={labelColor}>
        {children || `${percent.toFixed(2)}%`}
      </SText>
    </SContainer>
  )
}
