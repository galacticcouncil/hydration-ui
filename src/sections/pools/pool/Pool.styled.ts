import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  width: calc(100% + 24px);

  border-radius: 4px;
  background-color: ${theme.colors.darkBlue700};
  box-shadow: ${theme.shadows.contentBox};

  overflow: hidden;

  margin: 0 -12px;

  @media (${theme.viewport.gte.sm}) {
    margin: unset;
    width: 100%;
  }
`

export const SGridContainer = styled.div`
  display: grid;
  grid-column-gap: 0px;
  grid-row-gap: 18px;

  padding: 20px;

  @media ${theme.viewport.gte.sm} {
    padding: 30px;

    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 48px;
    grid-row-gap: 0px;

    > div:nth-of-type(1) {
      grid-area: 1 / 1 / 2 / 2;
    }
    > div:nth-of-type(2) {
      grid-area: 1 / 2 / 3 / 3;
    }
    > div:nth-of-type(3) {
      grid-area: 2 / 1 / 3 / 2;
    }
    > div:nth-of-type(4) {
      grid-area: 1 / 3 / 3 / 4;
    }
  }
`

export const SPositions = styled.div`
  background: rgba(${theme.rgbColors.darkBlue900}, 0.4);

  @media (${theme.viewport.gte.sm}) {
    padding: 20px 30px;
  }
`
