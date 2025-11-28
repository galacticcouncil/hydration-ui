import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

import { AvailableFarms } from "./AvailableFarms"
import { SupplyYieldOpportunity } from "./SupplyYieldOpportunity"

export const YieldOpportunitiesSection = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const { t } = useTranslation("liquidity")
  const isOmnipool = !isIsolatedPool(data)

  if (data.farms.length === 0) return null

  return (
    <>
      <SectionHeader
        sx={{
          mt: getTokenPx([
            "containers.paddings.mobileContent",
            "containers.paddings.primary",
          ]),
        }}
      >
        {t("details.section.yieldOpportunities")}
      </SectionHeader>
      <Flex
        width="100%"
        gap={getTokenPx("containers.paddings.primary")}
        sx={{ flexWrap: "wrap" }}
      >
        {isOmnipool && data.borrowApyData && (
          <SupplyYieldOpportunity borrowApyData={data.borrowApyData} />
        )}
        <AvailableFarms farms={data.farms} />
      </Flex>
    </>
  )
}
