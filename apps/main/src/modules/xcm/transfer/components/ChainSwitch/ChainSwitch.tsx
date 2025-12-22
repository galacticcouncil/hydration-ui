import { ArrowDown } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonProps,
  Flex,
  Icon,
  Separator,
} from "@galacticcouncil/ui/components"

import { SButton } from "./ChainSwitch.styled"

export const ChainSwitch: React.FC<ButtonProps> = (props) => {
  return (
    <Flex align="center" justify="center" position="relative">
      <Separator sx={{ flexShrink: 0, flex: 1 }} />
      <SButton variant="muted" {...props}>
        <Icon size={16} component={ArrowDown} />
      </SButton>
      <Separator sx={{ flexShrink: 0, flex: 1 }} />
    </Flex>
  )
}
