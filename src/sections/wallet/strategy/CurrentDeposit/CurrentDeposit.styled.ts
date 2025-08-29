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

export const SCurrentHollarDeposit = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-items: end;

  & > div:last-child {
    grid-column: 1 / -1;
  }

  @media ${theme.viewport.gte.md} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
  }
`
