import styled from "@emotion/styled"
import { theme } from "theme"

export const SWavySeparator = styled.div<{
  color?: string
  size?: number
  border?: number
  curvature?: number
}>`
  background-color: ${({ color }) => color ?? theme.colors.brightBlue300};

  ${({ size = 6, curvature = 0.8, border = 2 }) => {
    const p = curvature * size
    const r = Math.sqrt(p * p + size * size)
    return `
    height: ${2 * size}px;
    --mask: radial-gradient(
      calc(${r}px + ${border / 2}px) at 50% calc(100% + ${p}px),
      #0000 calc(99% - ${border}px),
      #000 calc(101% - ${border}px) 99%,
      #0000 101%
    )
    calc(50% - ${2 * size}px)
    calc(50% - ${size / 2}px - ${border / 2}px + 0.5px) / ${4 * size}px
    calc(${size}px + ${border}px) repeat-x,
  radial-gradient(
      calc(${r}px + ${border / 2}px) at 50% ${-1 * p}px,
      #0000 calc(99% - ${border}px),
      #000 calc(101% - ${border}px) 99%,
      #0000 101%
    )
    50% calc(50% + ${size / 2}px + ${border / 2}px) / ${4 * size}px
    calc(${size}px + ${border}px) repeat-x;
    `
  }}

  mask: var(--mask);
`
