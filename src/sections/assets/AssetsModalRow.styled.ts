import styled from "@emotion/styled"
import { theme } from "../../theme"

export const SAssetRow = styled.div`
  display: flex;
  cursor: pointer;
  margin: 0 -30px;
  padding: 15px 30px;
  box-sizing: content-box;
  justify-content: space-between;
  width: 100%;

  &:hover {
    background: rgba(${theme.rgbColors.primary100}, 0.06);
  }

  &:active {
    background: rgba(${theme.rgbColors.primary100}, 0.07);
  }
`
