import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { createVariants } from "@/utils"

export type CustomInputProps = {
  customSize?: "small" | "medium" | "large"
  variant?: "embedded" | "standalone"
  isError?: boolean
  isFullWidth?: boolean
  disabled?: boolean
}

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;
  }
`

const sizes = createVariants((theme) => ({
  small: css`
    height: 30px;
    padding: 0px ${theme.containers.paddings.tertiary}px;
    font-size: ${theme.paragraphSize.p6};
  `,
  medium: css`
    height: 36px;
    padding: 0px ${theme.containers.paddings.tertiary}px;
    font-size: ${theme.paragraphSize.p5};
  `,
  large: css`
    height: 54px;
    padding: 0px ${theme.containers.paddings.primary}px;
    font-size: ${theme.paragraphSize.p5};
  `,
}))

const variants = createVariants((theme) => ({
  embedded: css`
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

export const SInputContainer = styled.div<
  Pick<CustomInputProps, "customSize" | "variant">
>(({ customSize = "medium", variant = "standalone" }) => [
  sizes(customSize),
  variants(variant),
  css`
    display: flex;
    gap: 4px;
    align-items: center;
  `,
])

export const SInput = styled.input<CustomInputProps>(
  css``,
  ({ theme, isError = false }) => [
    css`
      width: 100%;

      box-sizing: border-box;

      display: flex;
      align-items: center;
      align-self: stretch;

      caret-color: ${theme.text.tint.Tertiary};

      cursor: text;
      font-weight: 500;

      transition: ${theme.transitions.colors};

      color: ${isError ? theme.accents.danger.secondary : theme.text.high};

      ::placeholder {
        color: ${theme.text.medium};
      }

      :disabled {
        cursor: not-allowed;
      }
    `,
    disabledStyles,
  ],
)
