import styled from "@emotion/styled"
import { theme } from "theme"

export const SProviderContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  padding-top: 12px;
`

export const SProviderButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;

  gap: 4px;
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
