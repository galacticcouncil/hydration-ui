import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { styled } from "@galacticcouncil/ui/utils"

export const SBankFlowRoot = styled(Flex)`
  flex: 1;
  min-height: 0;

  ${mq("sm")} {
    max-height: calc(
      100dvh - 2 * var(--modal-block-offset) - var(
          --modal-top-content-height,
          0px
        ) - var(--onramp-bottom-content-height, 0px)
    );
  }
`

export const SBankFlowContent = styled(Flex)`
  flex: 1;
  min-height: 0;

  /* The body owns scrolling and clipping so the modal chrome stays outside
     that viewport. */
  & > * {
    flex-shrink: 0;
  }

  & > [data-bank-flow-body] {
    flex: 1;
    min-height: 0;
  }
`
