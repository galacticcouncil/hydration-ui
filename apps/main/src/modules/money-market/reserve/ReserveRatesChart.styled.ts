import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

const drawIn = keyframes`
  from {
    clip-path: inset(-10px 100% -10px -10px);
  }

  to {
    clip-path: inset(-10px);
  }
`

export const SDrawIn = styled.div`
  .ts-chart__line,
  .ts-chart__area {
    animation: ${drawIn} 1.1s cubic-bezier(0.22, 1, 0.36, 1) backwards;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
`
