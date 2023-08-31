import { gradientBorder, theme } from "theme"
import styled from "@emotion/styled"

export const ProgressBarContainer = styled.div`
  ${gradientBorder};

  display: flex;
  flex-direction: column;

  gap: 12px;
  align-items: center;

  padding: 20px 30px;

  border-radius: 8px;

  &:before {
    border-radius: 8px;
  }
`

export const SBar = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  height: 18px;

  border-radius: 4px;

  background-color: rgba(${theme.rgbColors.alpha0}, 0.35);
`

export const SFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => Math.max(0, Math.min(100, percentage))}%;
  height: 100%;

  border-radius: 4px;

  background: ${theme.gradients.pinkLightBlue};

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
