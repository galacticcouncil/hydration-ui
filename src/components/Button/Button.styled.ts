import { css, SerializedStyles } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"
import { ButtonProps, ButtonSize, ButtonVariant } from "./Button"

export const SButton = styled.button<ButtonProps>`
  cursor: pointer;
  text-transform: ${({ transform }) => transform ?? "uppercase"};

  border: none;
  border-radius: 4px;

  ${({ variant }) => variant && variantStyles[variant]}
  ${({ size }) => size && sizeStyles[size]}
  ${({ active }) =>
    active &&
    css`
      background: ${theme.colors.brightBlue700};

      border: 1px solid ${theme.colors.brightBlue700};

      transition: all ${theme.transitions.default};
    `}

    ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    cursor: not-allowed;

    color: ${theme.colors.darkBlue300};
    background: rgba(218, 255, 238, 0.06);
    border-color: ${theme.colors.darkBlue300};

    &::after {
      all: unset;
    }
  }

  ${({ isLoading }) =>
    isLoading &&
    css`
      background: rgba(218, 255, 238, 0.06);
    `}
`

export const SContent = styled.span`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
`
export const SButtonTransparent = styled.button`
  background: transparent;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &[disabled] {
    cursor: unset;
  }
`

const variantStyles: Record<ButtonVariant, SerializedStyles> = {
  primary: css`
    background: ${theme.colors.pink700};
    color: ${theme.colors.white};

    :hover {
      background: ${theme.colors.pink400};
      color: ${theme.colors.basic800};
    }

    :active {
      background: ${theme.colors.pink100};
      color: ${theme.colors.basic800};
    }
  `,
  secondary: css`
    border-radius: 4px;
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
    color: ${theme.colors.brightBlue300};
    border: 1px solid ${theme.colors.brightBlue300};
    box-shadow: unset;

    :hover {
      background: rgba(${theme.rgbColors.brightBlue500}, 0.9);
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.brightBlue100};
    }

    :active {
      background: ${theme.colors.brightBlue400};
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.brightBlue100};
    }
  `,
  gradient: css`
    background: ${theme.gradients.pinkLightPink};
    color: ${theme.colors.white};

    position: relative;
    overflow: hidden;

    :hover {
      &::after {
        content: "";

        width: 100%;
        height: 100%;

        position: absolute;
        top: 0;
        left: 0;

        background: rgba(${theme.rgbColors.white}, 0.2);
      }
    }
    :active {
      &::after {
        background: rgba(${theme.rgbColors.black}, 0.2);
      }
    }
  `,
  outline: css`
    background: rgba(${theme.rgbColors.white}, 0.03);
    color: ${theme.colors.white};

    border: 1px solid rgba(${theme.rgbColors.white}, 0.1);

    :hover,
    :active {
      background: ${theme.colors.brightBlue700};
      border: 1px solid ${theme.colors.brightBlue700};

      transition: all ${theme.transitions.default};
    }
  `,
  transparent: css`
    background: transparent;
    color: ${theme.colors.brightBlue600};
  `,
}

const sizeStyles: Record<ButtonSize, SerializedStyles> = {
  medium: css`
    padding: 16px 23px;
    font-size: 14px;
  `,
  small: css`
    padding: 12px 15px;
    font-size: 12px;
    line-height: 12px;
  `,
  micro: css`
    padding: 2px 10px;
    font-size: 12px;
    line-height: 16px;
  `,
}
