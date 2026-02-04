import { FC } from "react"

import { Text } from "@/components"
import { getToken } from "@/utils"

export const PaginationDots: FC = () => {
  return (
    <Text width="l" fs="p2" color={getToken("text.low")} align="center">
      &#8230;
    </Text>
  )
}
