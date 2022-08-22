import styled, { css } from "styled-components"
import { theme } from "theme"

export const StyledMenuItem = styled.div<{ active?: boolean }>`
  color: ${theme.colors.neutralGray300};
  ${(p) =>
    p.active &&
    css`
      color: ${theme.colors.primary100};
    `};
`
