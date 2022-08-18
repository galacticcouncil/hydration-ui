import styled from "styled-components/macro"
import { theme } from "theme"

export const StyledBar = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  height: 12px;

  padding: 0 4px;

  background-color: ${theme.colors.backgroundGray800};
  border-radius: 9999px;
`

export const StyledFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => percentage}%;
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
