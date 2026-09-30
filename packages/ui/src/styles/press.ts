import { css } from "@emotion/react"

import { easings } from "@/styles/easings"

/**
 * Tactile press feedback.
 */
export const pressScaleTransition = `scale 0.1s ${easings.outQuad}`

export const pressScale = css`
  &:active:not(:disabled):not([aria-disabled="true"]):not([aria-busy="true"]) {
    scale: 0.96;
  }

  @media (prefers-reduced-motion: reduce) {
    &:active {
      scale: 1;
    }
  }
`
