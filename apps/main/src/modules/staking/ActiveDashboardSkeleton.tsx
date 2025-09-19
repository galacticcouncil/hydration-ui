import { Skeleton } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SActiveDashboard } from "@/modules/staking/ActiveDashboard.styled"

export const ActiveDashboardSkeleton: FC = () => {
  return (
    <SActiveDashboard>
      <Skeleton height={30} />
      <Skeleton height={200} />
    </SActiveDashboard>
  )
}
