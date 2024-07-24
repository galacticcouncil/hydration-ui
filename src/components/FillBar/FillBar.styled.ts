import styled from "@emotion/styled"
import { theme } from "theme"
import { FillBarVariant } from "./FillBar"

export const SBar = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  height: 7px;

  padding: 0 2px;

  background-color: rgba(${theme.rgbColors.alpha0}, 0.35);
`

export const SFill = styled.div<{
  percentage: number
  variant: FillBarVariant
}>`
  width: ${({ percentage }) => Math.max(0, Math.min(100, percentage))}%;
  height: 3px;

  background: ${({ variant }) =>
    variant === "primary"
      ? theme.colors.brightBlue500
      : variant === "full"
        ? "linear-gradient(90deg, #532051 0%, #AE2569 55.72%, #F6297C 100%)"
        : theme.gradients.lightGreenOrange};

  animation: stretch 0.75s ease-in-out;
  transform-origin: left center;

  @keyframes stretch {
    0% {
      transform: scaleX(0);
    }
    100% {
      transform: scaleX(100%);
    }
  }
`
