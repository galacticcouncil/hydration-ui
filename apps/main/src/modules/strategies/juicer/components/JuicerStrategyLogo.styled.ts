import { Box } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SJuicerStrategyLogo = styled(Box)(
  ({ theme }) => css`
    flex-shrink: 0;

    & svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    & svg path {
      fill: ${theme.accents.alertAlt.primary};
    }

    &[data-plain] svg > rect {
      display: none;
    }
  `,
)
