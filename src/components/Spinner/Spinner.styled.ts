import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import { getResponsiveStyles, ResponsiveValue } from "utils/responsive"

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`

export const SSpinnerContainer = styled.div<{
  size: ResponsiveValue<number>
}>`
  ${(p) => [
    getResponsiveStyles(p.size, (size) => ({ width: size })),
    getResponsiveStyles(p.size, (size) => ({ height: size })),
  ]}

  animation: ${spin} 0.6s linear infinite;
`

export const Gradient = styled.div`
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from 1deg at 50% 50%,
    rgba(10, 13, 26, 0) 90deg,
    rgba(255, 255, 255, 0.2) 99deg,
    #00c2ff 160deg,
    #b6cfff 249deg,
    #ffffff 353deg,
    rgba(10, 13, 26, 0) 358deg
  );
`
