import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { animations } from "@/styles/animations"

export const SRoot = styled(ScrollAreaPrimitive.Root)`
  height: 100%;
  width: 100%;
  position: relative;
`

export const SViewport = styled(ScrollAreaPrimitive.Viewport)`
  outline: none;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  -webkit-overflow-scrolling: touch;
`

export const SScrollbar = styled(ScrollAreaPrimitive.ScrollAreaScrollbar)(
  ({ theme }) => css`
    display: flex;
    touch-action: none;
    user-select: none;

    padding: 1px;
    border-radius: 9999px;
    background-color: ${theme.controls.dim.base};

    animation: ${animations.fadeIn} 0.2s ease;

    &[data-orientation="vertical"] {
      width: 6px;
    }

    &[data-orientation="horizontal"] {
      height: 6px;
      flex-direction: column;
    }
  `,
)

export const SThumb = styled(ScrollAreaPrimitive.ScrollAreaThumb)(
  ({ theme }) => css`
    background-color: ${theme.controls.solid.activeHover};
    position: relative;
    flex: 1;
    border-radius: 9999px;
  `,
)
