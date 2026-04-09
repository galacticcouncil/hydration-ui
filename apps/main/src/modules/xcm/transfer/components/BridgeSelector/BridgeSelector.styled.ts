import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"

const slide = keyframes`
  0%   { transform: translateX(-100%); opacity: 0; }
  8%   { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateX(100vw); opacity: 0; }
`

export const SBridgeOption = styled.button<{ active: boolean }>(
  ({ theme, active }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.space.base};

    position: relative;
    overflow: hidden;

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: ${theme.radii.m};

    padding-block: ${theme.space.l};
    padding-inline: ${theme.space.m};

    cursor: pointer;

    transition: ${theme.transitions.colors};

    ${active
      ? css`
          background-color: ${theme.controls.dim.active};
          border-color: ${theme.controls.dim.active};
        `
      : css`
          &:hover:not(:disabled) {
            background-color: ${theme.buttons.outlineDark.rest};
          }
        `}
  `,
)

export const SParticle = styled.div<{
  color: string
  duration: string
  delay: string
  active: boolean
}>(
  ({ color, duration, delay, active }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 48px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${color}28 60%,
      ${color}80 100%
    );
    opacity: ${active ? 1 : 0.2};
    animation: ${slide} ${duration} ${delay} linear infinite;
    pointer-events: none;
  `,
)
