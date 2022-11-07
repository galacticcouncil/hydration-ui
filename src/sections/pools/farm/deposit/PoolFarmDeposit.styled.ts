import { Button } from "components/Button/Button"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SGridContainer = styled.div`
  display: grid;
  grid-row-gap: 12px;
  > *:nth-child(1) {
    grid-area: 1 / 1 / 2 / 3;
  }
  > *:nth-child(2) {
    grid-area: 3 / 1 / 4 / 3;
  }
  > *:nth-child(3) {
    grid-area: 2 / 1 / 3 / 3;
  }

  @media (${theme.viewport.gte.sm}) {
    background: ${theme.colors.backgroundGray800};

    padding: 20px;

    border-radius: 12px;

    > *:nth-child(1) {
      grid-area: 1 / 1 / 2 / 2;
    }
    > *:nth-child(2) {
      grid-area: 1 / 2 / 2 / 3;
    }
    > *:nth-child(3) {
      grid-area: 2 / 1 / 3 / 3;
    }
  }
`

export const SMaxButton = styled(Button)`
  background: rgba(${theme.rgbColors.white}, 0.06);
  color: ${theme.colors.white};
  font-weight: 600;

  :hover {
    background: rgba(${theme.rgbColors.white}, 0.15);
  }
`
