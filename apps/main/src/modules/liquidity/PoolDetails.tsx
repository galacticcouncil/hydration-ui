import { Flex, Paper, SectionHeader } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { Outlet, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { useOmnipoolAsset, useXYKPool } from "@/states/liquidity"

import { PoolDetailsHeader, PoolDetailsValues } from "./components"

export const PoolDetails = () => {
  const { t } = useTranslation("liquidity")
  const { id } = useParams({ from: "/liquidity/$id" })

  const { data: omnipool } = useOmnipoolAsset(id)
  const { data: xykData } = useXYKPool(id)

  const data = omnipool || xykData

  if (!data) return null

  return (
    <Flex direction="column">
      <PoolDetailsHeader data={data} />
      <Flex gap={20} height={542}>
        <Paper sx={{ flex: 1 }}></Paper>

        <Paper width={360} p={getTokenPx("containers.paddings.primary")}>
          <PoolDetailsValues data={data} />
        </Paper>
      </Flex>
      <SectionHeader>{t("details.section.availableFarms")}</SectionHeader>

      <SectionHeader>{t("details.section.yourPositions")}</SectionHeader>
      <Outlet />
    </Flex>
  )
}
