import { keyframes } from "@emotion/react"

import { css, styled } from "@/utils"

export type FlashDirection = "up" | "down" | null

const flash = keyframes`
  0%,
  30% {
    color: var(--flash-color);
  }
  100% {
    color: inherit;
  }
`

export const SFlashValue = styled.span<{
  readonly direction: FlashDirection
  readonly duration: number
}>(({ theme, direction, duration }) =>
  direction
    ? css`
        --flash-color: ${direction === "up"
          ? theme.details.values.positive
          : theme.details.values.negative};

        animation: ${flash} ${duration}ms linear;
      `
    : css``,
)
