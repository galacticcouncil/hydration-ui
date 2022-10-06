import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const SMenuItem = styled.div<{ active?: boolean }>`
  color: ${theme.colors.neutralGray300};
  ${(p) =>
    p.active &&
    css`
      color: ${theme.colors.primary100};
    `};
`
