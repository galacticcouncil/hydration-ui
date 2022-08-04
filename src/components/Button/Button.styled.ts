import styled, { css } from "styled-components/macro";
import { theme } from "theme";
import { ButtonProps } from "./Button";

export const StyledButton = styled.button<ButtonProps>`
  border-radius: 61px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-transform: uppercase;

  ${(p) =>
    p.variant === "primary"
      ? p.disabled
        ? css`
            background: rgba(${theme.rgbColors.primarySuccess100}, 0.06);
            color: rgba(${theme.rgbColors.white}, 0.6);
            pointer-events: none;
          `
        : css`
            color: ${theme.colors.backgroundGray800};
            background: ${theme.colors.primarySuccess400};

            :hover {
              background: ${theme.colors.primarySuccess300};
              transition: background 0.2s ease-in-out;
            }

            :active {
              background: ${theme.colors.primarySuccess500};
              transition: background 0.2s ease-in-out;
            }
          `
      : ``}

  ${(p) =>
    p.size === "small" &&
    css`
      padding: 12px 15px;
      font-size: 12px;
      line-height: 18px;
    `};

  ${(p) =>
    p.size === "medium" &&
    css`
      padding: 16px 36px;
    `};

  ${(p) =>
    p.fullWidth &&
    css`
      width: 100%;
    `};

  ${(p) =>
    p.variant === "secondary"
      ? p.disabled
        ? css`
            background: ${theme.colors.backgroundGray700};
            color: rgba(${theme.rgbColors.white}, 0.106);
            pointer-events: none;
          `
        : css`
            background: rgba(${theme.rgbColors.primarySuccess450}, 0.12);
            color: ${theme.colors.primarySuccess400};

            :hover {
              background: rgba(${theme.rgbColors.primarySuccess450}, 0.3);
              transition: background 0.2s ease-in-out;
            }

            :active {
              background: rgba(${theme.rgbColors.primarySuccess450}, 0.5);
              transition: background 0.2s ease-in-out;
            }
          `
      : ``}
`;
