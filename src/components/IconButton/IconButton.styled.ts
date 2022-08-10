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
  background: rgba(${theme.rgbColors.primarySuccess100}, 0.05);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  ${colors};
  ${margins};
`
