import styled from "@emotion/styled"
import { theme } from "theme"

export const SAssetRow = styled.div`
  display: flex;
  justify-content: space-between;

  background: rgba(${theme.rgbColors.white}, 0.03);
  border-bottom: 1px solid ${theme.colors.darkBlue401};

  padding: 17px 12px;

  transition: ${theme.transitions.slow};
  cursor: pointer;

  @media ${theme.viewport.gte.sm} {
    padding: 17px 20px;
  }

  &:hover {
    background: rgba(${theme.rgbColors.white}, 0.06);
  }

  &:active {
    background: rgba(${theme.rgbColors.white}, 0.07);
  }
`
