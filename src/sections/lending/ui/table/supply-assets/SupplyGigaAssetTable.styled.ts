import { css } from "@emotion/react"

export const getSupplyGigaRowGradient = (rotation: number) => css`
  transition: none;
  background: linear-gradient(
    ${rotation}deg,
    rgba(12, 88, 138, 0.4) 0.04%,
    rgba(12, 88, 138, 0) 56.6%
  );
`
