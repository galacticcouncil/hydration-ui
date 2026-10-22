import {
  omnipoolYieldMetricsQuery as neckworkOmnipoolYieldMetricsQuery,
  stablepoolYieldMetricsQuery as neckworkStablepoolYieldMetricsQuery,
} from "@galacticcouncil/indexer/neckwork"
import { Flex, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { Farm } from "@/api/farms"
import { neckworkClient } from "@/api/neckwork"
import { AssetLogo } from "@/components/AssetLogo"
import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"
import { formatApyPercent } from "@/utils/formatApyPercent"

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
  const {
    data: omnipoolYieldMetrics,
    isLoading: isOmnipoolYieldMetricsLoading,
  } = useQuery({
    ...neckworkOmnipoolYieldMetricsQuery(neckworkClient),
    enabled: !!omnipoolId,
    select: (data) => data?.find((item) => item.assetId === omnipoolId),
  })

  const {
    data: stablepoolYieldMetrics,
    isLoading: isStablepoolYieldMetricsLoading,
  } = useQuery({
    ...neckworkStablepoolYieldMetricsQuery(neckworkClient),
    enabled: !!stablepoolId,
    select: (data) => data?.find((item) => item.poolId === stablepoolId),
  })

  if (isOmnipoolYieldMetricsLoading || isStablepoolYieldMetricsLoading) {
    return <Skeleton width={50} height="100%" />
  }

  const isFarms = !!farms.length

  const omnipoolFee = omnipoolYieldMetrics?.fee ?? undefined

  const stablepoolFee = stablepoolYieldMetrics?.feeAprPerc ?? undefined

  const borrowSupplyMMApy = borrowApyData?.supplyMMApy

  const isFeeUnknown =
    (!!omnipoolId && omnipoolFee === undefined) ||
    (!!stablepoolId && stablepoolFee === undefined)

  const totalApr =
    isFeeUnknown || (borrowSupplyMMApy === null && borrowApyData)
      ? null
      : farms
          .reduce((acc, farm) => acc.plus(farm.apr), Big(0))
          .plus(omnipoolFee ?? 0)
          .plus(stablepoolFee ?? 0)
          .plus(borrowSupplyMMApy ?? 0)
          .toNumber()

  if (!isFarms && !borrowApyData)
    return (
      <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
        {formatApyPercent(t, totalApr)}
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
      <Flex align="center" gap="s">
        <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
          {formatApyPercent(t, totalApr)}
        </Text>
        {!!incentivesLogoIds?.length && (
          <AssetLogo size="small" id={incentivesLogoIds} />
        )}
      </Flex>
    </TooltipAPR>
  )
}
