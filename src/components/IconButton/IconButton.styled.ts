import { colors, margins } from "common/styles"
import styled, { css } from "styled-components/macro"
import { theme } from "theme"
import { ColorProps } from "common/styles"

export const StyledIconButton = styled.button<{ round?: boolean } & ColorProps>`
  ${p =>
    p.round &&
    css`
      border-radius: 50%;
    `};

  width: 34px;
  height: 34px;
  background: ${p => p.bg || theme.colors.iconButtonGrey};
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
      background rgba(${theme.rgbColors.white},0.06);
      position: absolute;
      top: 0;
      left: 0;
    }
  }
`
