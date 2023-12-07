import styled from "@emotion/styled"
import { gradientBorder, theme } from "theme"

export const SBox = styled.div`
  background: ${theme.colors.darkBlue700};

  padding: 22px 20px;
  margin: -16px -13px 0;

  position: relative;

  ${gradientBorder}
  border-radius: 0;
  &::before {
    border-radius: 0;
  }

  @media ${theme.viewport.gte.sm} {
    margin: 0;
    border-radius: ${theme.borderRadius.stakingCard}px;
    &::before {
      border-radius: ${theme.borderRadius.stakingCard}px;
    }
  }
`
