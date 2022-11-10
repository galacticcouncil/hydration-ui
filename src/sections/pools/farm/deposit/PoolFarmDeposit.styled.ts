import { Button } from "components/Button/Button"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SGridContainer = styled.div`
  display: grid;
  grid-row-gap: 12px;

  grid-template-areas: "title title" "input input" "balance balance";

  @media (${theme.viewport.gte.sm}) {
    background: ${theme.colors.backgroundGray800};
    padding: 20px;
    border-radius: 12px;

    grid-template-areas: "title balance" "input input";
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
