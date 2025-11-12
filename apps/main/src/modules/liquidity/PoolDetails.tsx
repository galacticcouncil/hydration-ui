import { Flex, Paper } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC } from "react"

import { YieldOpportunitiesSection } from "@/modules/liquidity/components/AvailableFarms/YieldOpportunitiesSection"
import { PoolDetailsHeader } from "@/modules/liquidity/components/PoolDetailsHeader"
import { PoolDetailsValues } from "@/modules/liquidity/components/PoolDetailsValues"
import { PositionsTable } from "@/modules/liquidity/components/PositionsTable"
import { useOmnipoolAsset, useXYKPool } from "@/states/liquidity"

import { PoolDetailsSkeleton } from "./PoolDetailsSkeleton"

type Props = {
  readonly id: string
}

export const PoolDetails: FC<Props> = ({ id }) => {
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

      {data && <PositionsTable pool={data} />}

      <Flex gap={20}>
        <Paper sx={{ flex: 1 }}></Paper>

        <PoolDetailsValues data={data} />
      </Flex>

      <YieldOpportunitiesSection data={data} />

      <Outlet />
    </Flex>
  )
}
