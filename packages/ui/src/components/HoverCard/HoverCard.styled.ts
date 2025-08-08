import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import { Content } from "@radix-ui/react-hover-card"

export const animateIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.96);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
`

export const SHoverCardContent = styled(Content)`
  z-index: ${({ theme }) => theme.zIndices.modal};

  &[data-state="open"] {
    animation: 0.15s cubic-bezier(0.16, 1, 0.3, 1) ${animateIn};
  }
`
