import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import { DistributorAccruedRewards } from "@/components/DistributorAccruedRewards/DistributorAccruedRewards"
import {
  getDistributorRewardsAssetId,
  getDistributorRewardsSymbol,
} from "@/modules/money-market/rewards/DistributorRewards.utils"
import { RewardsModalRow } from "@/modules/money-market/rewards/RewardsModalRow"

type DistributorRewardsProps = {
  claim: RewardsDistributorClaim
  accrued: RewardsDistributorAccrued
}

/** The rewards distributor's entry in the rewards window's list. */
export const DistributorRewards: FC<DistributorRewardsProps> = ({
  claim,
  accrued,
}) => {
  const { t } = useTranslation("borrow")
  const { status, owed, owedUsd } = claim
  const symbol = getDistributorRewardsSymbol(claim, accrued)

  const blockedReason =
    status === "belowDeposit"
      ? t("distributorRewards.belowDeposit", { symbol })
      : status === "underfunded"
        ? t("distributorRewards.underfunded")
        : undefined

  return (
    <Flex direction="column" gap="s">
      <RewardsModalRow
        assetId={getDistributorRewardsAssetId(claim, accrued)}
        label={t("distributorRewards.label", { symbol })}
        symbol={symbol}
        amount={owed}
        amountUsd={owedUsd}
      />
      <DistributorAccruedRewards stages={accrued.stages} symbol={symbol} />
      {blockedReason && (
        <Text fs="p6" lh={1.2} color={getToken("accents.alert.primary")}>
          {blockedReason}
        </Text>
      )}
    </Flex>
  )
}
