import { Flex, Paper } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { Outlet, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { useOmnipoolAsset, useXYKPool } from "@/states/liquidity"

import {
  AvailableFarms,
  BalancePosition,
  PoolDetailsHeader,
  PoolDetailsValues,
  PositionsTable,
} from "./components"

export const PoolDetails = () => {
  const { t } = useTranslation("liquidity")
  const { id } = useParams({ from: "/liquidity/$id" })

  const { data: omnipool } = useOmnipoolAsset(id)
  const { data: xykData } = useXYKPool(id)

  const data = omnipool || xykData

  if (!data) return null

  return (
    <Flex direction="column" sx={{ position: "relative" }}>
      <PoolDetailsHeader data={data} />
      <Flex gap={20}>
        <Paper sx={{ flex: 1 }}></Paper>

        <Paper width={360} p={getTokenPx("containers.paddings.primary")}>
          <PoolDetailsValues data={data} />
        </Paper>
      </Flex>

      <AvailableFarms />

      {omnipool?.isStablePool ? (
        <BalancePosition
          label={t("liquidity.stablepool.position.label")}
          pool={omnipool}
        />
      ) : null}

      <PositionsTable assetId={id} />
      <Outlet />
    </Flex>
  )
}
