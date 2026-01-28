import { ArrowDown } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonProps,
  Flex,
  Icon,
  Separator,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { SButton } from "./ChainSwitch.styled"

export const ChainSwitch: React.FC<ButtonProps> = (props) => {
  return (
    <Flex align="center" justify="center" position="relative">
      <Separator sx={{ flexShrink: 0, flex: 1 }} />
      <SButton variant="muted" {...props}>
        <Icon
          size="s"
          component={ArrowDown}
          color={getToken("icons.primary")}
          sx={{ scale: 1.1 }}
        />
      </SButton>
      <Separator sx={{ flexShrink: 0, flex: 1 }} />
    </Flex>
  )
}
