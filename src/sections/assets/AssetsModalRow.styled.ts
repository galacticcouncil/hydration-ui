import styled from "@emotion/styled"
import { theme } from "../../theme"

export const SAssetRow = styled.div`
  display: flex;
  cursor: pointer;
  padding: 9px 0px;

  justify-content: space-between;
  width: 100%;

  background: rgba(${theme.rgbColors.white}, 0.03);

  border-bottom: 1px solid ${theme.colors.darkBlue401};

  box-sizing: content-box;
  margin: 0 -30px;
  padding: 15px 30px;

  transition: ${theme.transitions.slow};

  &:hover {
    background: rgba(${theme.rgbColors.white}, 0.06);
  }

  &:active {
    background: rgba(${theme.rgbColors.white}, 0.07);
  }
`
