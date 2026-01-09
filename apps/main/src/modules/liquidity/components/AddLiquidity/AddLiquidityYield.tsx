import {
  omnipoolYieldMetricsQuery,
  stablepoolYieldMetricsQuery,
} from "@galacticcouncil/indexer/squid"
import { Flex, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { Farm } from "@/api/farms"
import { useSquidClient } from "@/api/provider"
import { AssetLogo } from "@/components/AssetLogo"
import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"

export const AddLiquidityYield = ({
  omnipoolId,
  stablepoolId,
  farms,
  borrowApyData,
}: {
  omnipoolId?: string
  stablepoolId?: string
  farms: Farm[]
  borrowApyData?: BorrowAssetApyData
}) => {
  const { t } = useTranslation("common")
  const squidClient = useSquidClient()
  const {
    data: omnipoolYieldMetrics,
    isLoading: isOmnipoolYieldMetricsLoading,
  } = useQuery({
    ...omnipoolYieldMetricsQuery(squidClient),
    enabled: !!omnipoolId,
    select: (data) => data?.find((item) => item.assetId === omnipoolId),
  })

  const {
    data: stablepoolYieldMetrics,
    isLoading: isStablepoolYieldMetricsLoading,
  } = useQuery({
    ...stablepoolYieldMetricsQuery(squidClient),
    enabled: !!stablepoolId,
    select: (data) => data?.find((item) => item.poolId === stablepoolId),
  })

  if (isOmnipoolYieldMetricsLoading || isStablepoolYieldMetricsLoading) {
    return <Skeleton width={50} height="100%" />
  }

  const isFarms = !!farms.length
  const omnipoolFee = omnipoolYieldMetrics?.fee?.toString()
  const stablepoolFee = stablepoolYieldMetrics?.projectedAprPerc
  const totalApr = farms
    .reduce((acc, farm) => acc.plus(farm.apr), Big(0))
    .plus(omnipoolFee ?? 0)
    .plus(stablepoolFee ?? 0)
    .plus(borrowApyData?.supplyMMApy ?? 0)
    .toNumber()

  if (!isFarms && !borrowApyData)
    return (
      <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
        {t("percent", {
          value: totalApr,
        })}
      </Text>
    )

  const incentivesLogoIds = isFarms
    ? farms.map(({ rewardCurrency }) => rewardCurrency.toString())
    : borrowApyData?.incentives.map(({ rewardTokenAddress }) =>
        getAssetIdFromAddress(rewardTokenAddress),
      )

  return (
    <TooltipAPR
      farms={farms}
      omnipoolFee={omnipoolFee}
      stablepoolFee={stablepoolFee}
      borrowApyData={borrowApyData}
    >
      <Flex align="center" gap={4}>
        <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
          {t("percent", {
            value: totalApr,
          })}
        </Text>
        {!!incentivesLogoIds?.length && (
          <AssetLogo size="small" id={incentivesLogoIds} />
        )}
      </Flex>
    </TooltipAPR>
  )
}
