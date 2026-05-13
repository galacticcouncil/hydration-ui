import styled from "@emotion/styled"
import { css } from "@galacticcouncil/ui/utils"

export const SExpanderRoot = styled.div<{
  duration: number
  expanded: boolean
}>(({ theme, duration, expanded }) => [
  expanded
    ? css`
        grid-template-rows: 0fr;
        animation-name: ${theme.animations.expand};
      `
    : css`
        grid-template-rows: 1fr;
        animation-name: ${theme.animations.collapse};
      `,
  css`
    display: grid;
    animation-duration: ${duration}ms;
    animation-timing-function: ${theme.easings.outExpo};
    animation-fill-mode: forwards;
    & > div {
      min-height: 0;
      overflow: hidden;
    }
  `,
])
