import { css } from "@emotion/react"
import styled from "@emotion/styled"
import {
  CheckboxProps as RadixCheckboxProps,
  Root,
} from "@radix-ui/react-checkbox"
import { Ref } from "react"

import { Label } from "@/components/Label"
import { createVariants } from "@/utils"

export type CheckboxSize = "small" | "medium" | "large"

export type CheckboxProps = RadixCheckboxProps & {
  size?: CheckboxSize
  ref?: Ref<HTMLButtonElement>
}

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
`

const rootSizes = createVariants<CheckboxSize>((theme) => ({
  small: css`
    width: ${theme.sizes.s};
    height: ${theme.sizes.s};
  `,
  medium: css`
    width: ${theme.sizes.m};
    height: ${theme.sizes.m};
  `,
  large: css`
    width: ${theme.sizes.l};
    height: ${theme.sizes.l};
  `,
}))

const indicatorSizes = createVariants<CheckboxSize>(() => ({
  small: css`
    width: calc(100% - 4px);
    height: calc(100% - 4px);
  `,
  medium: css`
    width: calc(100% - 6px);
    height: calc(100% - 6px);
  `,
  large: css`
    width: calc(100% - 8px);
    height: calc(100% - 8px);
  `,
}))

export const SRoot = styled(Root)<{ size: CheckboxSize }>(
  ({ theme, size = "medium", disabled }) => [
    css`
      display: block;
      position: relative;
      flex-shrink: 0;

      border: 1px solid ${theme.controls.outline.base};
      border-radius: ${theme.radii.base};

      background: ${theme.controls.dim.base};

      cursor: pointer;

      transition: ${theme.transitions.colors};

      :not(:disabled):hover,
      &[data-state="checked"] {
        border-color: ${theme.controls.solid.active};
        background: ${theme.controls.dim.hover};
      }
    `,
    rootSizes(size),
    disabled && disabledStyles,
  ],
)

export const SIndicator = styled.div<{ size: CheckboxSize }>(
  ({ theme, size = "medium" }) => [
    css`
      margin: auto;
      background: ${theme.controls.solid.active};
      width: 50%;
      height: 50%;

      border-radius: ${theme.sizes["4xs"]};
    `,
    indicatorSizes(size),
  ],
)

export const SLabel = styled(Label)(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.base};

    cursor: pointer;
  `,
)
