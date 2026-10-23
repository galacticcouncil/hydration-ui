import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SOnrampFlowContent = styled(Flex)(
  ({ theme }) => css`
    ${mq("max-xs")} {
      flex: 1;
      min-height: 0;
    }

    & > :not([hidden]) ~ :not([hidden]) {
      border-top: 1px solid ${theme.details.separators};
    }
  `,
)
