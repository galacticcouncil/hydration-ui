import { ColorProps, colors, MarginProps, margins } from "utils/styles"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SIconButton = styled.button<
  { round?: boolean } & ColorProps & MarginProps
>`
  ${(p) => p.round && "border-radius: 9999px;"};

  min-width: 34px;
  min-height: 34px;
  background: ${(p) => p.bg || theme.colors.iconButtonGrey};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  ${colors};
  ${margins};

  :hover {
    &::after {
      content: "";
      width: 100%;
      height: 100%;
      background: rgba(${theme.rgbColors.white}, 0.06);
      position: absolute;
      top: 0;
      left: 0;
    }
  }
`
