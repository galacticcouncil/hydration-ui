import { theme } from "theme"
import styled from "@emotion/styled"

export const SContainer = styled.div`
  all: unset;
  display: flex;
  flex-direction: row;
  align-items: center;

  position: relative;

  gap: 25px;

  padding: 12px;
  background: rgba(${theme.rgbColors.white}, 0.03);
  border-radius: 12px;

  transition: all ${theme.transitions.default};

  &:hover {
    background: rgba(${theme.rgbColors.white}, 0.06);
  }

  &:active {
    background: rgba(${theme.rgbColors.white}, 0.09);
  }
`

export const SLink = styled.a`
  ::after {
    content: "";
    position: absolute;
    inset: 0;
  }
`
