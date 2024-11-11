import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { createVariants } from "@/utils"

export type CustomInputProps = {
  customSize?: "small" | "medium"
  variant?: "embeded" | "standalone"
  isError?: boolean
  isFullWidth?: boolean
}

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;

    opacity: 0.2;
  }
`

const sizes = createVariants(() => ({
  small: css`
    height: 36px;
  `,
  medium: css`
    height: 54px;
  `,
}))

const variants = createVariants((theme) => ({
  embeded: css`
    border: none;

    :focus,
    :focus-visible,
    :hover {
      outline: none;
    }
  `,
  standalone: css`
    background-color: ${theme.Buttons.outlineDark.Rest};
    border: 1px solid ${theme.Buttons.outlineDark.Rest};
    border-radius: ${theme.Containers["Corner radius"]["buttons-primary"]}px;

    :focus,
    :focus-visible {
      outline: none;
      background-color: ${theme.Buttons.outlineDark.Hover};
      border-color: ${theme.Buttons.Secondary.Outline.Outline};
    }

    :hover {
      background-color: ${theme.Buttons.outlineDark.Hover};
      outline: none;
    }
  `,
}))

export const SInput = styled.input<CustomInputProps>(
  css``,
  ({
    theme,
    variant = "embeded",
    customSize = "medium",
    isFullWidth = false,
    isError = false,
  }) => [
    sizes(customSize),
    variants(variant),
    css`
      min-width: 84px;
      width: ${isFullWidth ? "100%" : undefined};

      box-sizing: border-box;

      display: flex;
      align-items: center;
      align-self: stretch;

      padding: 0px ${theme.Containers.Paddings.tertiary}px;

      font-size: ${theme.paragraphSize.p5};
      font-family: ${theme.fontFamilies1.Secondary};

      caret-color: ${theme.Text.tint.Tertiary};

      ::placeholder {
        font-family: Geist;
        color: ${theme.Text.Medium};
      }

      cursor: pointer;
      font-weight: 500;
      line-height: 120%;

      display: inline-flex;

      transition: all 0.15s ease-in-out;

      color: ${isError ? theme.Accents.Danger.Primary : theme.Text.High};
    `,
    disabledStyles,
  ],
)
