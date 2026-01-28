import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

type Props = {
  readonly children: ReactNode
  readonly className?: string
}

export const LockExpiration: FC<Props> = ({ children, className }) => {
  return (
    <Flex
      className={className}
      px="xs"
      gap="s"
      align="center"
      borderRadius={12}
      bg="rgba(255,255,255,0.06)"
    >
      <Text fw={500} fs="p6" lh="s" color={getToken("colors.darkBlue.200")}>
        {children}
      </Text>
      <Icon
        component={CircleInfo}
        size="s"
        color={getToken("icons.onContainer")}
      />
    </Flex>
  )
}
