import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ modal: boolean }>`
  background: rgba(10, 12, 22, 0.69);
  position: relative;
  text-align: center;
  width: 100%;

  padding: ${(p) => (p.modal ? "20px 0" : "20px 10px")};

  @media ${theme.viewport.gte.sm} {
    background: inherit;
  }
`
