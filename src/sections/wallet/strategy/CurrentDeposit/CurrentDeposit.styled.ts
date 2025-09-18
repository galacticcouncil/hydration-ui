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
  }
`

export const SCurrentHollarDepositGrid = styled.div`
  display: flex;
  gap: 20px;

  flex-wrap: wrap;

  @media ${theme.viewport.gte.sm} {
    display: grid;
    grid-template-columns: 2fr 4fr 1fr;
    gap: 12px;
  }
`

export const SCurrentHollarDepositValues = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 20px;
  column-gap: 12px;
  align-items: end;
  width: 100%;
`
