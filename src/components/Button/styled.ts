import styled, { css } from "styled-components/macro";
import { theme } from "theme";
import { ButtonProps } from ".";

export const StyledButton = styled.button<ButtonProps>`
  border-radius: 61px;
  font-weight: 700;
  border: none;
  cursor: pointer;

  ${(p) =>
    p.variant === "primary" && p.disabled
      ? css`
          background: ${theme.colors.backgroundGray900};
          color: rgba(${theme.rgbColors.white}, 0.13);
          pointer-events: none;
        `
      : css`
          background: ${theme.colors.primarySuccess400};

          :hover {
            background: ${theme.colors.primarySuccess300};
            transition: background 0.2s ease-in-out;
          }

          :active {
            background: ${theme.colors.primarySuccess500};
            transition: background 0.2s ease-in-out;
          }
        `}

  ${(p) =>
    p.size === "small" &&
    css`
      padding: 12px 15px;
    `}
  
    
    ${(p) =>
    p.size === "medium" &&
    css`
      padding: 16px 36px;
    `}
`;
