import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  width: 100%;
  background: ${theme.gradients.cardGradient};
  overflow: hidden;
  border-radius: 20px;
`

export const GridContainer = styled.div`
  padding: 16px;
  display: grid;
  grid-column-gap: 0px;
  grid-row-gap: 18px;

  @media (${theme.viewport.gte.sm}) {
    padding: 24px;
    display: grid;
    grid-template-columns: 1fr repeat(2, min-content);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 48px;
    grid-row-gap: 0px;

    > div:nth-child(1) {
      grid-area: 1 / 1 / 2 / 2;
    }
    > div:nth-child(2) {
      grid-area: 1 / 2 / 3 / 3;
    }
    > div:nth-child(3) {
      grid-area: 2 / 1 / 3 / 2;
    }
    > div:nth-child(4) {
      grid-area: 1 / 3 / 3 / 4;
    }
  }
`
