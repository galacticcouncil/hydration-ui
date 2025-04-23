import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

const CIRC = Math.ceil(2 * Math.PI * 5)

const animateCircle = keyframes`
  0% {
    opacity: 1;
    stroke-dashoffset: ${CIRC};
  }

  60% {
    opacity: 1;
    stroke-dashoffset: 0;
  }
  
  100% {
    opacity: 0;
    stroke-dashoffset: 0;
  }
`

export const SStatusSuccess = styled.span`
  position: relative;
  width: 7px;
  height: 7px;

  & > span {
    position: absolute;
    width: 7px;
    height: 7px;
    display: block;
    background: currentColor;
    border-radius: ${({ theme }) => theme.radii.full}px;
  }

  & > svg {
    transform: rotate(-90deg) scale(1.6);
    circle {
      stroke-dasharray: ${CIRC};
      stroke-dashoffset: ${CIRC};
      animation: ${animateCircle} 1s linear forwards;
    }
  }
`

export const SStatusOffline = styled.span`
  display: block;
  width: 7px;
  height: 7px;
  background: currentColor;
`
