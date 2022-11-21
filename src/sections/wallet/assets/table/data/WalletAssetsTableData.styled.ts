import styled from "@emotion/styled"
import { theme } from "theme"

export const SIcon = styled.div<{ large?: boolean }>`
  &,
  svg {
    width: ${({ large }) => (large ? "42px" : "24px")};
    height: ${({ large }) => (large ? "42px" : "24px")};
  }

  @media (${theme.viewport.gte.sm}) {
    &,
    svg {
      width: 32px;
      height: 32px;
    }
  }
`
