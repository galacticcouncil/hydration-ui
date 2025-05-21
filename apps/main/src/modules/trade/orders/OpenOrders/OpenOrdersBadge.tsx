import { Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx, px } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

type Props = {
  readonly children: ReactNode
  readonly className?: string
}

export const OpenOrdersBadge: FC<Props> = ({ children, className }) => {
  return (
    <Text
      fw={700}
      fs={8}
      lh={px(14)}
      color={getToken("colors.azureBlue.900")}
      borderRadius={getTokenPx("containers.cornerRadius.containersPrimary")}
      px={4}
      borderWidth={1}
      borderStyle="solid"
      borderColor="#212837"
      bg="#DFB1F3"
      className={className}
    >
      {children}
    </Text>
  )
}
