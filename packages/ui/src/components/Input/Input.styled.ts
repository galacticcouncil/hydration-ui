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
    background-color: ${theme.buttons.outlineDark.rest};
    border: 1px solid ${theme.buttons.outlineDark.rest};
    border-radius: ${theme.radii.full}px;

    :focus,
    :focus-visible {
      outline: none;
      background-color: ${theme.buttons.outlineDark.hover};
      border-color: ${theme.buttons.secondary.outline.outline};
    }

    :hover {
      background-color: ${theme.buttons.outlineDark.hover};
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

      padding: 0px ${theme.containers.paddings.tertiary}px;

      font-size: ${theme.paragraphSize.p5};
      font-family: ${theme.fontFamilies1.secondary};

      caret-color: ${theme.text.tint.Tertiary};

      ::placeholder {
        font-family: Geist;
        color: ${theme.text.medium};
      }

      cursor: pointer;
      font-weight: 500;
      line-height: 120%;

      display: inline-flex;

      transition: transition: ${theme.transitions.colors};

      color: ${isError ? theme.accents.danger.secondary : theme.text.high};
    `,
    disabledStyles,
  ],
)
