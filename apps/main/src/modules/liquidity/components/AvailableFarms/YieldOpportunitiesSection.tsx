import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
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
  const isSupplyApy = isOmnipool && data.borrowApyData

  if (data.farms.length === 0 && !isSupplyApy) return null

  return (
    <>
      <SectionHeader
        sx={{ mt: ["0", "xl"] }}
        title={t("details.section.yieldOpportunities")}
      />
      <Flex
        width="100%"
        gap={["secondary", "primary"]}
        sx={{ flexWrap: "wrap" }}
      >
        {isOmnipool && data.borrowApyData && (
          <SupplyYieldOpportunity
            borrowApyData={data.borrowApyData}
            omnipoolFee={data.lpFeeOmnipool}
            stablepoolFee={data.lpFeeStablepool}
          />
        )}
        <AvailableFarms farms={data.farms} />
      </Flex>
    </>
  )
}
