import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, lazy } from "react"

const RewardsInfoDesktop = lazy(async () => ({
  default: await import("@/modules/staking/RewardsInfo.desktop").then(
    (m) => m.RewardsInfoDesktop,
  ),
}))

const RewardsInfoMobile = lazy(async () => ({
  default: await import("@/modules/staking/RewardsInfo.mobile").then(
    (m) => m.RewardsInfoMobile,
  ),
}))

type Props = {
  readonly allocatedRewards: string
  readonly isLoading: boolean
}

export const RewardsInfo: FC<Props> = ({ allocatedRewards, isLoading }) => {
  const { isMobile } = useBreakpoints()

  if (isMobile) {
    return (
      <RewardsInfoMobile
        allocatedRewards={allocatedRewards}
        isLoading={isLoading}
      />
    )
  }

  return (
    <RewardsInfoDesktop
      allocatedRewards={allocatedRewards}
      isLoading={isLoading}
    />
  )
}
