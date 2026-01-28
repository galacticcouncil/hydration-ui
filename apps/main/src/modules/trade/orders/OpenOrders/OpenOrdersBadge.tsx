import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

type Props = {
  readonly children: ReactNode
  readonly className?: string
}

export const OpenOrdersBadge: FC<Props> = ({ children, className }) => {
  return (
    <Text
      fw={700}
      fs="p6"
      lh="s"
      color={getToken("colors.azureBlue.900")}
      borderRadius="xl"
      px="s"
      size="s"
      align="center"
      borderWidth={1}
      borderStyle="solid"
      borderColor="#212837"
      bg={getToken("colors.lavender.500")}
      className={className}
    >
      {children}
    </Text>
  )
}
