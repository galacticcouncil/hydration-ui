import styled from "styled-components"
import { theme } from "theme"

export const SSelectItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: ${theme.colors.backgroundGray800};
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background: rgba(${theme.rgbColors.primary100}, 0.06);
  }

  &:active {
    background: rgba(${theme.rgbColors.primary450}, 0.15);
  }
`
