import { useGigaAccountBalance } from "@/api/gigaStake"
import { GigaHDXDescription } from "@/modules/staking/gigaStaking/GigaHDXDescription"
import { GigaHDXPosition } from "@/modules/staking/gigaStaking/GigaHDXPosition"

export const GigaStakingDashboard = () => {
  const { data: gigaAccountBalance } = useGigaAccountBalance()
  // Check `total`, not `transferable`. A fully-staked user has all their
  // GIGAHDX (aToken) locked by the lock-manager (`Stakes.gigahdx`), so
  // `transferable` is 0 even though they hold a real position. Gating on
  // `transferable` hides `GigaHDXPosition` — which contains the claim-
  // rewards CTA and yield/borrow readouts — from every staked user.
  const total = gigaAccountBalance?.total ?? 0n

  return total > 0n ? <GigaHDXPosition /> : <GigaHDXDescription />
}
