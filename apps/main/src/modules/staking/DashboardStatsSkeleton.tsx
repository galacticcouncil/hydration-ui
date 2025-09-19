import { Flex, Skeleton } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SDashboardStats } from "@/modules/staking/DashboardStats.styled"

export const DashboardStatsSkeleton: FC = () => {
  return (
    <SDashboardStats sx={{ width: "100%" }}>
      <Skeleton height={130} width="90%" />
      <Flex direction="column" width="70%" gap={10}>
        <Skeleton sx={{ height: 100 }} />
        <Skeleton sx={{ height: 100 }} />
      </Flex>
    </SDashboardStats>
  )
}
