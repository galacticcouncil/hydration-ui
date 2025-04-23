import styled from "@emotion/styled"
import { theme } from "theme"

export const SSearchContainer = styled.div`
  position: relative;

  & > svg {
    position: absolute;

    top: 50%;
    left: 12px;

    transform: translateY(-50%);

    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  input[type="text"] {
    background: rgba(158, 167, 186, 0.06);

    &:not(:hover):not(:focus) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    padding-left: 48px;

    &::placeholder {
      color: rgba(${theme.rgbColors.white}, 0.4);
    }
  }
`
