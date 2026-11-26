import { Text } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

const DURATION = "0.2s"

const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

// Collapses to zero height with no amount, so the APY line sits alone.
export const SAmountReveal = styled.div<{ isEmpty: boolean }>(
  ({ isEmpty }) => css`
    display: grid;
    grid-template-rows: ${isEmpty ? "0fr" : "1fr"};
    opacity: ${isEmpty ? 0 : 1};
    transition:
      grid-template-rows ${DURATION},
      opacity ${DURATION};
    ${reducedMotion}

    & > * {
      min-height: 0;
      overflow: hidden;
    }
  `,
)

export const SApyText = styled(Text)`
  transition:
    font-size ${DURATION},
    line-height ${DURATION},
    color ${DURATION};
  ${reducedMotion}
`
