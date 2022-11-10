import { Button } from "components/Button/Button"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  border-radius: 12px;
  background: rgba(${theme.rgbColors.brightBlue100}, 0.06);
  padding: 14px;

  grid-row-gap: 5px;
  display: grid;

  grid-template-areas: "title title" "input input" "balance balance";

  @media (${theme.viewport.gte.sm}) {
    padding: 20px;
    grid-row-gap: 11px;

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

export const SSelectAssetButton = styled(Button)`
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 10px;
  text-transform: none;

  padding: 5px;
  margin-right: 18px;

  :hover {
    background: rgba(${theme.rgbColors.white}, 0.15);
  }
`
