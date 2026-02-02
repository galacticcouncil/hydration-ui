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
    padding: ${theme.space.s};
    font-size: ${theme.fontSizes.p6};
    svg {
      width: ${theme.space.l};
      height: ${theme.space.l};
    }
  `,
  medium: css`
    padding: ${theme.space.base};
    font-size: ${theme.fontSizes.p4};
    svg {
      width: ${theme.space.xl};
      height: ${theme.space.xl};
    }
  `,
  large: css`
    padding: ${theme.space.m};
    font-size: ${theme.fontSizes.p4};
    svg {
      width: ${theme.space.m};
      height: ${theme.space.m};
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
})<ToggleGroupProps>(({ theme, size = "medium" }) => [
  css`
    display: flex;
    align-items: center;
    gap: ${size === "small" ? theme.space.xs : theme.space.s};
    padding: ${size === "small" ? theme.space.xs : theme.space.s};

    border-radius: ${theme.radii.full};
    border: 1px solid ${theme.buttons.secondary.low.borderRest};
  `,
])

export const SToggleGroupItem = styled(ToggleGroupPrimitive.Item, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "size",
})<{
  size?: ToggleGroupSize
}>(({ theme, size = "medium" }) => [
  css`
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: ${theme.space.base};

    cursor: pointer;

    font-weight: 500;
    white-space: nowrap;

    border: 0;
    border-radius: ${theme.radii.full};

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
