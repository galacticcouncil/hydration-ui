import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { pressScale, pressScaleTransition } from "@/styles/press"
import { createVariants } from "@/utils"

export type CustomInputProps = {
  customSize?: "small" | "medium" | "large"
  variant?: "embedded" | "standalone"
  isError?: boolean
  isFullWidth?: boolean
  disabled?: boolean
}

const sizes = createVariants((theme) => ({
  small: css`
    --input-height: 1.875rem;
    --input-padding: ${theme.containers.paddings.tertiary};
    --input-icon: 1rem;
    --input-gap: 0.25rem;

    font-size: ${theme.fontSizes.p6};
  `,
  medium: css`
    --input-height: 2.5rem;
    --input-padding: ${theme.containers.paddings.tertiary};
    --input-icon: 1.125rem;
    --input-gap: 0.375rem;

    font-size: ${theme.fontSizes.p5};
  `,
  large: css`
    --input-height: 3.125rem;
    --input-padding: ${theme.containers.paddings.primary};
    --input-icon: 1.25rem;
    --input-gap: 0.5rem;

    font-size: ${theme.fontSizes.p5};
  `,
}))

const variants = createVariants((theme) => ({
  embedded: css`
    border: none;
  `,
  standalone: css`
    background-color: ${theme.buttons.outlineDark.rest};
    border: 1px solid ${theme.buttons.outlineDark.rest};
    border-radius: ${theme.radii.full};

    /* a text field matches :focus-visible on click too, so focus changes the fill and border instead of drawing a ring */
    &:has(input:focus-visible) {
      background-color: ${theme.buttons.outlineDark.hover};
      border-color: color-mix(in srgb, ${theme.text.low} 60%, transparent);
    }

    /* the red Chip's soft colors, declared after the focus rule so an invalid field stays red while focused */
    &:has(input[aria-invalid="true"]) {
      background-color: ${theme.tags.soft.red.background};
      border-color: color-mix(
        in srgb,
        ${theme.tags.soft.red.foreground} 40%,
        transparent
      );
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: ${theme.buttons.outlineDark.hover};
      }
    }
  `,
}))

export const SInputContainer = styled.div<
  Pick<CustomInputProps, "customSize" | "variant">
>(({ theme, customSize = "medium", variant = "standalone" }) => [
  sizes(customSize),
  variants(variant),
  css`
    /*
     * Insets an icon from the edge by the space above and below it, so it sits
     * centred in the rounded end at every size. The padding covers part of that.
     */
    --input-icon-inset: calc(
      (var(--input-height) - var(--input-icon)) / 2 - var(--input-padding)
    );

    display: flex;
    height: var(--input-height);
    padding: 0 var(--input-padding);
    gap: var(--input-gap);
    align-items: center;

    transition: ${theme.transitions.colors};

    svg {
      flex-shrink: 0;
      color: ${theme.icons.onSurface};
    }

    & > svg[data-icon] {
      width: var(--input-icon);
      height: var(--input-icon);
    }

    /* in the container's base styles, so the embedded variant gets it too */
    &:has(input[aria-invalid="true"]) > svg[data-icon] {
      color: ${theme.tags.soft.red.foreground};
    }

    & > svg[data-icon="start"] {
      margin-inline-start: var(--input-icon-inset);
    }

    & > svg[data-icon="end"] {
      margin-inline-end: var(--input-icon-inset);
    }
  `,
])

export const SInput = styled.input<CustomInputProps>(
  ({ theme, isError = false }) => css`
    flex: 1;
    min-inline-size: 0;
    align-self: stretch;

    caret-color: ${theme.text.tint.Tertiary};

    cursor: text;
    font-weight: 500;

    transition: ${theme.transitions.colors};

    color: ${isError ? theme.tags.soft.red.foreground : theme.text.high};

    ::placeholder {
      color: ${theme.text.medium};
    }

    :disabled {
      cursor: not-allowed;
    }
  `,
)

export const SInputClear = styled.button(
  ({ theme }) => css`
    position: relative;
    flex: none;

    width: var(--input-icon);
    height: var(--input-icon);
    margin-inline-end: var(--input-icon-inset);

    color: ${theme.icons.onSurface};
    cursor: pointer;

    transition:
      color 0.2s,
      ${pressScaleTransition};

    ${pressScale}

    /* nothing to clear, or nothing the user may change */
    input:is(:placeholder-shown, :disabled, :read-only) ~ & {
      display: none;
    }

    /* a larger hit area than the icon */
    &::after {
      content: "";
      position: absolute;
      inset: -0.5rem;
    }

    /* doubled to beat the container's own svg color */
    && > svg {
      width: 100%;
      height: 100%;
      color: inherit;
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: ${theme.text.high};
      }
    }

    &:active {
      color: ${theme.text.high};
    }

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
      border-radius: ${theme.radii.full};
    }
  `,
)
