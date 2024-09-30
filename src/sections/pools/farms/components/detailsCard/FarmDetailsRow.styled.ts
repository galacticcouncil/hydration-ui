import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  position: relative;

  padding: 10px 12px;

  border-radius: 4px;
  border: 1px solid rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);

  transition: all ${theme.transitions.default};

  outline: none;

  cursor: pointer;

  &:hover {
    border: 1px solid ${theme.colors.brightBlue500};
  }
`
