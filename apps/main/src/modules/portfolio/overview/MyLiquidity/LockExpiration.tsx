import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

type Props = {
  readonly children: ReactNode
  readonly className?: string
}

export const LockExpiration: FC<Props> = ({ children }) => {
  return (
    <Text fw={500} fs="p6" lh="s" color={getToken("colors.darkBlue.200")}>
      {children}
    </Text>
  )
}
