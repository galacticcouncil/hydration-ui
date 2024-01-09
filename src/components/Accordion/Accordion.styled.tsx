import { gradientBorder, theme } from "theme"
import styled from "@emotion/styled"

export const SContainer = styled.div<{ expanded: boolean }>`
  background: rgba(${theme.rgbColors.bg}, 0.4);
  padding: 30px;

  cursor: pointer;

  :hover {
    background-color: rgba(${theme.rgbColors.alpha0}, 0.03);
  }

  ${gradientBorder};
  border-radius: ${theme.borderRadius.stakingCard}px;
  &::before {
    border-radius: ${theme.borderRadius.stakingCard}px;
  }
`

export const SContent = styled.div<{
  columns: number
}>`
  margin-top: 40px;
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  color: ${theme.colors.white};

  @media ${theme.viewport.gte.sm} {
    grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
  }
`
