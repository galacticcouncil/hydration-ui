import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import { hexToRgb, theme } from "theme"

export const SRowContainer = styled.div`
  position: relative;

  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  @media ${theme.viewport.gte.sm} {
    grid-template-columns: 100px 1fr;
  }
`

export const SBarContainer = styled.div`
  transform-origin: left;

  width: calc(100% - 10px);
`

export const SBar = styled.div<{
  color?: string
  percentage?: number
  slanted?: boolean
}>`
  --rgb-color: ${({ color }) =>
    color ? hexToRgb(color) : theme.rgbColors.brightBlue600};

  position: relative;

  height: 33px;
  max-width: 100%;
  min-width: 10px;
  width: ${({ percentage }) => percentage}%;

  border-radius: 6px;
  border-bottom-right-radius: ${({ slanted }) => (slanted ? "3px" : "6px")};

  transform: ${({ slanted }) => (slanted ? "skewX(-45deg)" : "none")};

  background: linear-gradient(
    90deg,
    rgba(var(--rgb-color), 0) 0%,
    rgba(var(--rgb-color), 1) 90%
  );
`

export const SLabelContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;

  position: absolute;
  z-index: 1;

  @media ${theme.viewport.gte.sm} {
    position: static;
  }
`

export const SContainer = styled.div<{ isLoading: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  ${SRowContainer} {
    opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
  }

  ${({ isLoading }) => !isLoading && animateBarContainer}
`

const revealKeyframes = keyframes`
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
`

const animateBarContainer = css`
  ${SBarContainer} {
    animation: ${revealKeyframes} 1s cubic-bezier(0.22, 1, 0.36, 1);
  }
`
