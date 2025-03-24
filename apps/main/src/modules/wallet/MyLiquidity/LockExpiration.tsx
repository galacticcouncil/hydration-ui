import { HelpIcon } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

type Props = {
  readonly children: ReactNode
}

export const LockExpiration: FC<Props> = ({ children }) => {
  return (
    <Flex px={2} gap={4} borderRadius={12} bg="rgba(255,255,255,0.06)">
      <Text
        fw={500}
        fs={11}
        lh={px(15)}
        color={getToken("colors.darkBlue.200")}
      >
        {children}
      </Text>
      <Icon
        component={HelpIcon}
        size={14}
        color={getToken("icons.onContainer")}
      />
    </Flex>
  )
}
