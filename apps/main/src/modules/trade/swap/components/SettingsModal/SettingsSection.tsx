import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

type Props = {
  readonly label: string
  readonly children: ReactNode
}

export const SettingsSection: FC<Props> = ({ label, children }) => {
  return (
    <Flex direction="column" gap="s" pt="m" pb="l">
      <Text fs="p5" lh={1.2} color={getToken("text.medium")}>
        {label}
      </Text>
      {children}
    </Flex>
  )
}
