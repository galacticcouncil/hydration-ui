import styled from "@emotion/styled"
import { theme } from "theme"

export const SIcon = styled.div<{ large?: boolean }>`
  width: ${({ large }) => (large ? "42px" : "24px")};
  height: ${({ large }) => (large ? "42px" : "24px")};
  flex-shrink: 0;

  @media ${theme.viewport.gte.sm} {
    width: 27px;
    height: 27px;
  }
`
