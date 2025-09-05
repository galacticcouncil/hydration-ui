import { ResponsiveStyleValue } from "@theme-ui/css"
import { FC, Ref } from "react"

import { BoxProps } from "@/components/Box"
import {
  SBackgroundCircle,
  SContainer,
  SProgressCircle,
  SText,
} from "@/components/ProgressCircle/ProgressCircle.styled"
import { useResponsiveValue } from "@/styles/media"
import { getToken } from "@/utils"

export type LabelPosition = "start" | "center" | "end"

export type ProgressCircleProps = BoxProps & {
  radius?: ResponsiveStyleValue<number>
  thickness?: ResponsiveStyleValue<number>
  percent: number
  label?: React.ReactNode
  isReversed?: boolean
  labelPosition?: ResponsiveStyleValue<LabelPosition>
  fontSize?: ResponsiveStyleValue<number>
  ref?: Ref<HTMLDivElement>
}

export const ProgressCircle: FC<ProgressCircleProps> = ({
  radius: givenRadius,
  thickness: givenThickness,
  labelPosition: givenLabelPosition,
  percent = 0,
  isReversed = false,
  label,
  fontSize = 14,
  color = getToken("controls.solid.accent"),
  ref,
  ...props
}) => {
  const radius = useResponsiveValue(givenRadius, 45)
  const thickness = useResponsiveValue(givenThickness, 4)
  const labelPosition = useResponsiveValue(givenLabelPosition, "center")
  const { circumference, size, position, transformFlip, transformRotate } =
    calculateCircleProps(radius, thickness, isReversed)

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
}

function calculateCircleProps(
  radius: number,
  thickness: number,
  isReversed: boolean,
) {
  const circumference = radius * 2 * Math.PI
  const size = radius * 2 + thickness
  const position = radius + thickness / 2
  const transformFlip = isReversed ? `scale(1, -1) translate(0, -${size})` : ""
  const transformRotate = isReversed
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
