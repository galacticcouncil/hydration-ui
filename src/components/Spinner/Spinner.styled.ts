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

  animation: ${spin} 0.6s linear infinite;

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

export const ToastSpinner = styled(Spinner)`
  background: conic-gradient(
    from 0deg,
    rgba(10, 13, 26, 0) 28.46deg,
    rgba(43, 166, 255, 0.14) 44.98deg,
    rgba(146, 183, 255, 0.38) 57.63deg,
    #ffffff 88deg,
    #ffffff 100deg,
    #ffffff 200deg
  );
`
