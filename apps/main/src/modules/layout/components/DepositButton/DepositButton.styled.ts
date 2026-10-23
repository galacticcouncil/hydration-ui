import { keyframes } from "@emotion/react"
import { Button } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

const claimPulse = keyframes`
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(1.04, 1.12); }
`

export const SDepositButton = styled(Button, {
  shouldForwardProp: (prop: string) => prop !== "claimAttention",
})<{ claimAttention: boolean }>(
  ({ theme, claimAttention }) =>
    claimAttention &&
    css`
      &::after {
        content: "";
        position: absolute;
        inset: ${theme.space["-xs"]};
        border: 1px solid ${theme.buttons.secondary.accent.onRest};
        border-radius: inherit;
        pointer-events: none;
        animation: ${claimPulse} 2.8s ${theme.easings.inOutSine} infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        &::after {
          animation: none;
          opacity: 0.3;
        }
      }
    `,
)
