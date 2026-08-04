import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { useGigaApr } from "@/api/gigaApr"
import { gigaTotalLockedQuery } from "@/api/gigaStake"
import { useStakingSupply } from "@/modules/staking/DashboardStats.data"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useStakingStats = () => {
  const rpc = useRpcProvider()
  const { native } = useAssets()

  const { total: gigaProjectedApr, isLoading: isGigaAprLoading } = useGigaApr()
  const { data: gigaLockedHDX, isLoading: isGigaLockedHDXLoading } = useQuery(
    gigaTotalLockedQuery(rpc),
  )
  const { circulatingSupply, isLoading: isStakingSupplyLoading } =
    useStakingSupply()

  const isLoading =
    isGigaAprLoading || isGigaLockedHDXLoading || isStakingSupplyLoading

  const gigaHdxStaked = Number(scaleHuman(gigaLockedHDX ?? 0n, native.decimals))
  const gigaHdxStakedPercent =
    Number(circulatingSupply) > 0
      ? Big(gigaHdxStaked).div(circulatingSupply).mul(100).toNumber()
      : 0

  return {
    data: {
      gigaProjectedApr,
      gigaHdxStaked,
      gigaHdxStakedPercent,
    },
    isLoading,
  }
}
