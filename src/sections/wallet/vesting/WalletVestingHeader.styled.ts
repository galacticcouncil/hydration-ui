import styled from "@emotion/styled"
import { theme } from "../../../theme"

export const STable = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid rgba(${theme.rgbColors.white}, 0.12);
  border-radius: 16px;
  padding: 29px;
  justify-content: space-between;
  align-self: center;
`

export const SSeparator = styled.div`
  height: auto;
  width: 1px;
  background: rgba(${theme.rgbColors.white}, 0.12);
`
