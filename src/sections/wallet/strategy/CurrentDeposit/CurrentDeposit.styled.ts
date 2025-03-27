import styled from "@emotion/styled"
import { theme } from "theme"

export const SCurrentDeposit = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;
  row-gap: 22px;

  @media ${theme.viewport.gte.sm} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    max-width: 450px;
  }
`
