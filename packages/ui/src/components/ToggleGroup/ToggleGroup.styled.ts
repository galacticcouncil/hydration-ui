import isPropValid from "@emotion/is-prop-valid"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { createVariants } from "@/utils"

export type ToggleGroupSize = "small" | "medium" | "large"

export type ToggleGroupProps = {
  size?: ToggleGroupSize
}

const sizes = createVariants<ToggleGroupSize>((theme) => ({
  small: css`
    padding: ${theme.scales.paddings.s}px;
    font-size: ${theme.paragraphSize.p6};
    svg {
      width: 16px;
      height: 16px;
    }
  `,
  medium: css`
    padding: ${theme.scales.paddings.base}px;
    font-size: ${theme.paragraphSize.p4};
    svg {
      width: 20px;
      height: 20px;
    }
  `,
  large: css`
    padding: ${theme.scales.paddings.m}px;
    font-size: ${theme.paragraphSize.p4};
    svg {
      width: 24px;
      height: 24px;
    }
  `,
}))

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
`

export const SToggleGroup = styled(ToggleGroupPrimitive.Root, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "size",
})<ToggleGroupProps>(({ theme }) => [
  css`
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: ${theme.scales.paddings.xs}px;

    padding: ${theme.scales.paddings.xs}px;

    border-radius: ${theme.radii.full}px;
    border: 1px solid ${theme.controls.outline.base};
  `,
])

export const SToggleGroupItem = styled(ToggleGroupPrimitive.Item, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "size",
})<{
  size?: ToggleGroupSize
}>(({ theme, size = "medium" }) => [
  css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.scales.paddings.base}px;

    cursor: pointer;

    font-weight: 500;
    white-space: nowrap;

    border: 0;
    border-radius: ${theme.radii.full}px;

    transition: ${theme.transitions.colors};

    background-color: transparent;
    color: ${theme.icons.onSurface};

    &[data-state="on"] {
      background-color: ${theme.buttons.primary.medium.rest};
      color: ${theme.buttons.primary.medium.onButton};
    }
  `,
  sizes(size),
  disabledStyles,
])
