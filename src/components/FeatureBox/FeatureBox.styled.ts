import styled from "@emotion/styled"
import { gradientBorder, theme } from "theme"

export const SContainer = styled.div<{
  bordered: boolean
}>`
  width: 100%;
  color: ${theme.colors.white};

  padding: ${({ bordered }) => (bordered ? "25px 20px" : "0")};

  ${({ bordered }) => bordered && gradientBorder};
  ${({ bordered }) =>
    bordered &&
    `
      border-radius: ${theme.borderRadius.stakingCard}px;
      &::before {
        border-radius: ${theme.borderRadius.stakingCard}px;
      }
  `};
`
