import styled from "@emotion/styled"
import { theme } from "theme"

export const SWalletStrategy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${theme.viewport.gte.sm} {
    gap: 30px;
  }
`
