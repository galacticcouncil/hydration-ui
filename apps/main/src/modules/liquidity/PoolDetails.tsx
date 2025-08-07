import { Flex, Paper } from "@galacticcouncil/ui/components"
import { Outlet, useParams } from "@tanstack/react-router"

import { AvailableFarmsSection } from "@/modules/liquidity/components/AvailableFarms/AvailableFarmsSection"
import { PoolDetailsHeader } from "@/modules/liquidity/components/PoolDetailsHeader"
import { PoolDetailsValues } from "@/modules/liquidity/components/PoolDetailsValues"
import { useOmnipoolAsset, useXYKPool } from "@/states/liquidity"

import { PoolDetailsSkeleton } from "./PoolDetailsSkeleton"

export const PoolDetails = () => {
  const { id } = useParams({ from: "/liquidity/$id" })

  const { data: omnipoolData, isLoading: isOmnipoolLoading } =
    useOmnipoolAsset(id)
  const { data: xykData, isLoading: isXYKLoading } = useXYKPool(id)

  const data = omnipoolData || xykData
  const isLoading = isOmnipoolLoading || isXYKLoading

  if (isLoading) return <PoolDetailsSkeleton />

  if (!data) return null

  return (
    <Flex direction="column" sx={{ position: "relative" }}>
      <PoolDetailsHeader data={data} />

      {/* {data && <PositionsTable pool={data} />} */}

      <Flex gap={20}>
        <Paper sx={{ flex: 1 }}></Paper>

        <PoolDetailsValues data={data} />
      </Flex>

      <AvailableFarmsSection />

      <Outlet />
    </Flex>
  )
}
