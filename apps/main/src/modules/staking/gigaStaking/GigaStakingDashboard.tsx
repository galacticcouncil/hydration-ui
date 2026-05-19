import { useGigaAccountBalance } from "@/api/gigaStake"
import { GigaHDXDescription } from "@/modules/staking/gigaStaking/GigaHDXDescription"
import { GigaHDXPosition } from "@/modules/staking/gigaStaking/GigaHDXPosition"

export const GigaStakingDashboard = () => {
  const { data: gigaAccountBalance } = useGigaAccountBalance()
  const transferable = gigaAccountBalance?.transferable ?? 0n

  return transferable > 0n ? <GigaHDXPosition /> : <GigaHDXDescription />
}
