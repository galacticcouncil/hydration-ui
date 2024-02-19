import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"
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

export const Spinner = styled.span<{
  width?: ResponsiveValue<number>
  height?: ResponsiveValue<number>
}>`
  --spinner-width: 3px;

  display: block;
  position: relative;

  border-radius: 9999px;
  mask: radial-gradient(
    farthest-side,
    rgba(255, 255, 255, 0) calc(100% - var(--spinner-width)),
    rgba(255, 255, 255, 1) calc(100% - var(--spinner-width) + 1px)
  );

  #animation: ${spin} 0.6s linear infinite;

  overflow: hidden;

  background: ${theme.gradients.spinner};

  &:before {
    content: "";
    position: absolute;

    width: var(--spinner-width);
    height: var(--spinner-width);

    border-radius: 9999px;
    top: 0;
    left: 50%;

    transform: translateX(calc(var(--spinner-width) / -2));
  }

  ${(p) => [
    getResponsiveStyles(p.width, (width) => ({ width })),
    getResponsiveStyles(p.height, (height) => ({ height })),
  ]}
`
