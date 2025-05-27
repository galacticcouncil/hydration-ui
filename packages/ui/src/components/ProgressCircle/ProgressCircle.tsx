import { ResponsiveStyleValue } from "@theme-ui/css"
import { forwardRef } from "react"

import { BoxProps } from "@/components/Box"
import {
  SBackgroundCircle,
  SContainer,
  SProgressCircle,
  SText,
} from "@/components/ProgressCircle/ProgressCircle.styled"
import { getToken } from "@/utils"

export type LabelPosition = "start" | "center" | "end"

export type ProgressCircleProps = BoxProps & {
  radius?: number
  thickness?: number
  percent: number
  label?: React.ReactNode
  reversed?: boolean
  labelPosition?: LabelPosition
  fontSize?: ResponsiveStyleValue<number>
}

export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  (
    {
      radius = 45,
      thickness = 4,
      percent = 0,
      reversed = false,
      label,
      labelPosition = "center",
      fontSize = 14,
      color = getToken("controls.solid.accent"),
      ...props
    },
    ref,
  ) => {
    const { circumference, size, position, transformFlip, transformRotate } =
      calculateCircleProps(radius, thickness, reversed)

    return (
      <SContainer ref={ref} color={color} {...props}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <SBackgroundCircle
            strokeWidth={Math.max(thickness - 2, 1)}
            r={radius}
            cx={position}
            cy={position}
          />
          <SProgressCircle
            percent={percent}
            transform={`${transformFlip} ${transformRotate}`}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percent / 100) * circumference}
            strokeLinecap="round"
            r={radius}
            cx={position}
            cy={position}
          />
        </svg>
        <SText position={labelPosition} sx={{ fontSize }}>
          {label || `${percent}%`}
        </SText>
      </SContainer>
    )
  },
)

ProgressCircle.displayName = "ProgressCircle"

function calculateCircleProps(
  radius: number,
  thickness: number,
  reversed: boolean,
) {
  const circumference = radius * 2 * Math.PI
  const size = radius * 2 + thickness
  const position = radius + thickness / 2
  const transformFlip = reversed ? `scale(1, -1) translate(0, -${size})` : ""
  const transformRotate = reversed
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
