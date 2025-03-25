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
  animation: reveal 1s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: left;

  width: calc(100% - 10px);

  @keyframes reveal {
    0% {
      transform: scaleX(0);
    }
    100% {
      width: scaleX(1);
    }
  }
`

export const SBar = styled.div<{ color?: string; percentage?: number }>`
  --rgb-color: ${({ color }) =>
    color ? hexToRgb(color) : theme.rgbColors.brightBlue600};

  height: 33px;
  max-width: 100%;
  width: ${({ percentage }) => percentage}%;

  position: relative;
  border-radius: 4px;
  transform: skewX(-40deg);

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
