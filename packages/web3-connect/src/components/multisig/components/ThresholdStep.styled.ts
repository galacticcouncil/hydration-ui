import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SThresholdStepContainer = styled(Flex)(
  ({ theme }) => css`
    flex: 1;
    > button {
      flex: 1;
      border-radius: 0;
      margin-left: -1px;
      &:first-of-type {
        border-top-left-radius: ${theme.radii.full};
        border-bottom-left-radius: ${theme.radii.full};
      }
      &:last-of-type {
        border-top-right-radius: ${theme.radii.full};
        border-bottom-right-radius: ${theme.radii.full};
      }
    }
  `,
)
