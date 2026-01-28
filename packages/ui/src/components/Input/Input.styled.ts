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
    height: 1.875rem;
    padding: 0px ${theme.containers.paddings.tertiary};
    font-size: ${theme.fontSizes.p6};
  `,
  medium: css`
    height: 2.5rem;
    padding: 0px ${theme.containers.paddings.tertiary};
    font-size: ${theme.fontSizes.p5};
  `,
  large: css`
    height: 3.125rem;
    padding: 0px ${theme.containers.paddings.primary};
    font-size: ${theme.fontSizes.p5};
  `,
}))

const variants = createVariants((theme) => ({
  embedded: css`
    border: none;

    has(:focus),
    has(:focus-visible),
    :hover {
      outline: none;
    }
  `,
  standalone: css`
    background-color: ${theme.buttons.outlineDark.rest};
    border: 1px solid ${theme.buttons.outlineDark.rest};
    border-radius: ${theme.radii.full};

    :has(:focus),
    :has(:focus-visible) {
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
>(({ theme, customSize = "medium", variant = "standalone" }) => [
  sizes(customSize),
  variants(variant),
  css`
    display: flex;
    gap: ${theme.space.s};
    align-items: center;

    transition: ${theme.transitions.colors};

    svg {
      flex-shrink: 0;
      color: ${theme.icons.onSurface};
    }
  `,
])

export const SInput = styled.input<CustomInputProps>(
  css``,
  ({ theme, isError = false }) => [
    css`
      flex: 1;
      min-width: 0;
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
