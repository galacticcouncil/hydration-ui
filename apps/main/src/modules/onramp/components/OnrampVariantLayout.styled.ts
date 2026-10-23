import { TabsRoot } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { styled } from "@galacticcouncil/ui/utils"

import { SOnrampFlowContent } from "./OnrampFlowContent.styled"

export const SOnrampVariantContent = styled(SOnrampFlowContent)`
  flex: 1;
  min-height: 0;

  & > :first-child:not(:last-child),
  & > :last-child:not(:first-child) {
    flex-shrink: 0;
  }
`

export const SOnrampVariantRoot = styled(TabsRoot)`
  display: flex;
  flex-direction: column;
  min-height: 0;

  ${mq("sm")} {
    max-height: calc(
      100dvh - 2 * var(--modal-block-offset) - var(
          --onramp-bottom-content-height,
          0px
        )
    );
  }

  ${mq("max-xs")} {
    height: 100%;
  }
`
