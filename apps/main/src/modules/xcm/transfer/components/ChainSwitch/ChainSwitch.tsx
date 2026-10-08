import { ArrowDown } from "@galacticcouncil/ui/assets/icons"
import { ButtonProps, Flex, Separator } from "@galacticcouncil/ui/components"

import { SButton } from "./ChainSwitch.styled"

export const ChainSwitch: React.FC<ButtonProps> = (props) => {
  return (
    <Flex align="center" justify="center" position="relative">
      <Separator sx={{ flexShrink: 0, flex: 1 }} />
      <SButton icon={ArrowDown} variant="muted" {...props} />
      <Separator sx={{ flexShrink: 0, flex: 1 }} />
    </Flex>
  )
}
