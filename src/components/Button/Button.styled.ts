import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"
import { ButtonProps } from "./Button"
import { Spinner } from "components/Spinner/Spinner.styled"

export const SButton = styled.button<ButtonProps>`
  border-radius: 9999px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  text-transform: ${({ transform }) => (transform ? transform : "uppercase")};
  line-height: 18px;

  transition: background ${theme.transitions.default};

  ${(p) =>
    p.variant === "primary"
      ? p.disabled
        ? css`
            background: rgba(${theme.rgbColors.primary100}, 0.06);
            color: rgba(${theme.rgbColors.white}, 0.6);
            pointer-events: none;
          `
        : css`
            color: ${theme.colors.backgroundGray800};
            background: ${theme.colors.primary400};

            :hover {
              background: ${theme.colors.primary300};
            }

            :active {
              background: ${theme.colors.primary500};
            }
          `
      : ``}

  ${(p) =>
    p.size === "small" &&
    css`
      padding: 12px 15px;
      font-size: 12px;
    `};

  ${(p) =>
    p.size === "medium" &&
    css`
      padding: 16px 36px;
      font-size: 14px;
    `};
  ${(p) =>
    p.size === "micro" &&
    css`
      padding: 2px 10px;
      font-size: 12px;
      line-height: 16px;
    `};

  ${(p) =>
    p.fullWidth &&
    css`
      width: 100%;
    `};

  ${(p) =>
    p.variant === "gradient"
      ? p.disabled
        ? css`
            background: ${theme.colors.backgroundGray700};
            color: rgba(${theme.rgbColors.white}, 0.6);
            position: relative;
            overflow: hidden;
          `
        : css`
            background: ${theme.gradients.primaryGradient};
            color: ${theme.colors.backgroundGray800};
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
          `
      : ``};

  ${(p) =>
    p.variant === "secondary"
      ? p.disabled
        ? css`
            background: ${theme.colors.backgroundGray700};
            color: rgba(${theme.rgbColors.white}, 0.106);
            pointer-events: none;
          `
        : css`
            background: rgba(${theme.rgbColors.primary450}, 0.12);
            color: ${theme.colors.primary400};

            :hover {
              background: rgba(${theme.rgbColors.primary450}, 0.3);
              transition: background ${theme.transitions.default};
            }

            :active {
              background: rgba(${theme.rgbColors.primary450}, 0.5);
              transition: background ${theme.transitions.default};
            }
          `
      : ``};

  ${(p) =>
    p.variant === "transparent"
      ? css`
          background: transparent;
          color: ${theme.colors.primary450};
        `
      : ``}

  ${(p) =>
    p.variant === "outline"
      ? p.active
        ? css`
            background: ${theme.colors.primary450};
            color: ${theme.colors.black};
            border: 1px solid ${theme.colors.primary450};
          `
        : css`
            background: transparent;
            color: ${theme.colors.primary300};
            border: 1px solid rgba(${theme.rgbColors.primary300}, 0.12);

            :hover,
            :active {
              background: ${theme.colors.primary450};
              color: ${theme.colors.black};
              border: 1px solid ${theme.colors.primary450};
              transition: all ${theme.transitions.default};
            }
          `
      : ``}

  ${(p) =>
    p.capitalize &&
    css`
      text-transform: capitalize;
    `}
`

export const SContent = styled.span`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
`

export const SSpinner = styled(Spinner)`
  margin-left: -4px;
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
