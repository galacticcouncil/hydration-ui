import { theme } from "theme"
import { forwardRef } from "react"
import { SContainer, SText } from "./CircularProgress.styled"
import { ResponsiveValue } from "utils/responsive"

export type LabelPosition = "start" | "center" | "end"

export type CircularProgressProps = {
  radius?: number
  thickness?: number
  percent: number
  children?: React.ReactNode
  inverted?: boolean
  labelPosition?: LabelPosition
  color?: keyof typeof theme.colors
  fontSize?: ResponsiveValue<number>
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export const CircularProgress = forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(
  (
    {
      radius = 45,
      thickness = 4,
      percent = 0,
      children,
      inverted = false,
      labelPosition = "center",
      color = "green600",
      fontSize = 16,
      ...props
    },
    ref,
  ) => {
    const { circumference, size, position, transformFlip, transformRotate } =
      calculateProps(radius, thickness, inverted)
    return (
      <SContainer ref={ref} {...props}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            sx={{ color: "primaryA0" }}
            css={{ opacity: 0.35 }}
            strokeWidth={Math.max(thickness - 2, 1)}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={position}
            cy={position}
          />
          <circle
            sx={{ color }}
            transform={`${transformFlip} ${transformRotate}`}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percent / 100) * circumference}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={position}
            cy={position}
          />
        </svg>
        <SText position={labelPosition} sx={{ fontSize }}>
          {children || `${percent.toFixed(2)}%`}
        </SText>
      </SContainer>
    )
  },
)

function calculateProps(radius: number, thickness: number, inverted: boolean) {
  const circumference = radius * 2 * Math.PI
  const size = radius * 2 + thickness
  const position = radius + thickness / 2
  const transformFlip = inverted ? `scale(1, -1) translate(0, -${size})` : ""
  const transformRotate = inverted
    ? `rotate(90, ${size / 2} ,${size / 2})`
    : `rotate(-90, ${size / 2} ,${size / 2})`

  return {
    circumference,
    size,
    position,
    transformFlip,
    transformRotate,
  }
}
