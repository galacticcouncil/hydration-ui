import styled, { css } from "styled-components/macro";
import { theme } from "theme";
import { IconButtonProps } from "./IconButton";

export const StyledIconButton = styled.button<IconButtonProps>`
  ${(p) =>
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

  svg {
    width: 16px;
    height: 16px;
  }
`;
