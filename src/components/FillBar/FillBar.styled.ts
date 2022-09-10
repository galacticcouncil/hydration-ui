import styled from "styled-components"
import { theme } from "theme"

export const SBar = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  height: 12px;

  padding: 0 4px;

  background-color: ${theme.colors.backgroundGray800};
  border-radius: 9999px;
`

export const SFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => Math.max(0, Math.min(100, percentage))}%;
  height: 4px;

  background: ${theme.colors.primary500};
  border-radius: 9999px;

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
