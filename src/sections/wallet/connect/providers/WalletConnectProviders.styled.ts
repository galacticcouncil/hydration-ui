import styled from "@emotion/styled"
import { theme } from "theme"

export const SWalletButton = styled.button`
  display: flex;
  align-items: center;

  width: 100%;

  gap: 16px;
  padding: 16px;

  border: none;
  border-radius: 4px;

  transition: background ${theme.transitions.default};
  cursor: pointer;

  background: rgba(${theme.rgbColors.primaryA06}, 0.06);

  &:hover {
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
  }

  &:active {
    background: rgba(${theme.rgbColors.brightBlue100}, 0.35);
  }
`
