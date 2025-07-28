import {
  AccountAvatar,
  Box,
  Flex,
  Skeleton,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SAccountOption } from "@/components/account/AccountOption.styled"

export const AccountOptionSkeleton: FC = () => {
  return (
    <SAccountOption>
      <Flex align="center" gap={12}>
        <Box sx={{ flexShrink: 0 }}>
          <AccountAvatar address="" />
        </Box>
        <Flex direction="column" width="100%" sx={{ alignSelf: "flex-start" }}>
          <Skeleton sx={{ width: 75, ml: "auto" }} />
        </Flex>
      </Flex>
    </SAccountOption>
  )
}
