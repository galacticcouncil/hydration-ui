import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"

import { LabelPosition } from "./ProgressCircle"

export const SContainer = styled(Box)`
  display: inline-flex;
  overflow: hidden;
  position: relative;
  gap: 10px;

  width: fit-content;
  height: fit-content;
`

export const SText = styled.span<{ position: LabelPosition }>(
  ({ theme, position }) => {
    const centerStyles = css`
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `

    const orderStyles = css`
      order: ${position === "start" ? -1 : 1};
    `

    return css`
      color: ${theme.text.high};
      font-weight: 500;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      ${position === "center" ? centerStyles : orderStyles}
    `
  },
)

export const SBackgroundCircle = styled.circle`
  stroke: currentColor;
  fill: transparent;
  opacity: 0.35;
`

const progressAnimation = (circumference: number, percent: number) => keyframes`
  from {
    stroke-dashoffset: ${circumference};
  }
  to {
    stroke-dashoffset: ${circumference - (percent / 100) * circumference};
  }
`

export const SProgressCircle = styled.circle<{
  percent: number
}>(({ theme, strokeDasharray, percent }) => {
  return css`
    stroke: currentColor;
    fill: transparent;
    animation: ${progressAnimation(Number(strokeDasharray), percent)} 0.3s;
    animation-timing-function: ${theme.easings.outCirc};
  `
})
