import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { styled } from "@galacticcouncil/ui/utils"

export const SPoolDetailsActionsContainer = styled(Flex)`
  position: fixed;
  left: 0;
  bottom: 0px;
  z-index: 3;
  height: 72px;
  padding: 12px;
  width: calc(100% - 0px);
  backdrop-filter: blur(10px);
  background: linear-gradient(0deg, #030816 2.59%, rgba(3, 8, 22, 0) 89.06%);

  ${mq("md")} {
    position: unset;
    height: auto;
    padding: 0;
    width: auto;
    backdrop-filter: none;
    background: transparent;
  }
`
