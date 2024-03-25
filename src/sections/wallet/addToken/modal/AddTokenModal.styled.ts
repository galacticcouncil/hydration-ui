import styled from "@emotion/styled"
import { theme } from "theme"

export const AssetRow = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${theme.colors.white};

  border-bottom: 1px solid rgba(${theme.rgbColors.primaryA06}, 0.06);

  padding: 17px 12px;

  transition: ${theme.transitions.slow};
  cursor: pointer;

  @media ${theme.viewport.gte.sm} {
    padding: 17px 20px;
  }

  &:hover {
    background: rgba(${theme.rgbColors.white}, 0.06);
  }
`
