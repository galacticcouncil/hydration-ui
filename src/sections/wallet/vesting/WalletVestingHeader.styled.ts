import styled from "@emotion/styled"
import { theme } from "../../../theme"

export const STable = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-self: center;

  border: 1px solid rgba(${theme.rgbColors.white}, 0.12);
  border-radius: 4px;

  padding: 20px;
  margin-top: 15px;

  width: 100%;

  @media ${theme.viewport.gte.sm} {
    border: unset;

    margin-top: 0;
    padding: 0;

    width: 50%;
  }
`

export const SSeparator = styled.div`
  width: 1px;
  height: 50px;

  background: rgba(${theme.rgbColors.white}, 0.12);
`
