import { keyframes } from "@emotion/react"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const PROGRESS_MOVE_MS = 900

const ease = `${PROGRESS_MOVE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
const STRIPE = "rgba(255, 255, 255, 0.3)"
const STRIPE_SIZE = 12

const march = keyframes`
  from { background-position: 0 0; }
  to { background-position: ${STRIPE_SIZE}px 0; }
`

// The soft tag background is the hue at low alpha in both themes; opaque, it
// is the hue itself (the soft foreground turns near-black in light mode).
const opaque = (color: string) => color.replace(/\/\s*[\d.]+\)$/, "/ 1)")

export const SProgress = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
    width: ${pxToRem(160)};
    color: ${theme.tags.soft.blue.foreground};
  `,
)

export const STrack = styled.div(
  ({ theme }) => css`
    position: relative;
    height: ${pxToRem(6)};
    border-radius: ${theme.radii.full};
    overflow: hidden;
    background-color: ${theme.tags.soft.blue.background};
  `,
)

const bar = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: inherit;
  transition: width ${ease};
`

export const SFill = styled.div(({ theme }) => [
  bar,
  css`
    background-color: ${opaque(theme.tags.soft.blue.background)};
    background-image: linear-gradient(
      45deg,
      ${STRIPE} 25%,
      transparent 25% 50%,
      ${STRIPE} 50% 75%,
      transparent 75%
    );
    background-size: ${STRIPE_SIZE}px ${STRIPE_SIZE}px;
    animation: ${march} 700ms linear infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
])
