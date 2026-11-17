import { Flex, TableCell, TableRow, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import { AssetLogo } from "@/components/AssetLogo"
import { DistributorAccruedRewards } from "@/components/DistributorAccruedRewards/DistributorAccruedRewards"
import {
  getDistributorRewardsAssetId,
  getDistributorRewardsSymbol,
} from "@/modules/borrow/dashboard/components/DistributorRewards.utils"

type DistributorRewardsProps = {
  claim: RewardsDistributorClaim
  accrued: RewardsDistributorAccrued
}

/** The rewards distributor's row in the rewards window's table. */
export const DistributorRewards: FC<DistributorRewardsProps> = ({
  claim,
  accrued,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { status, owed, owedUsd } = claim
  const symbol = getDistributorRewardsSymbol(claim, accrued)

  const blockedReason =
    status === "belowDeposit"
      ? t("borrow:distributorRewards.belowDeposit", { symbol })
      : status === "underfunded"
        ? t("borrow:distributorRewards.underfunded")
        : undefined

  return (
    <TableRow>
      <TableCell>
        <Flex direction="column" gap="s">
          <Flex align="center" gap="s">
            <AssetLogo id={getDistributorRewardsAssetId(claim, accrued)} />
            <Text fs="p3" fw={600}>
              {t("borrow:distributorRewards.label", { symbol })}
            </Text>
          </Flex>
          <DistributorAccruedRewards stages={accrued.stages} symbol={symbol} />
          {blockedReason && (
            <Text fs="p6" lh={1.2} color={getToken("accents.alert.primary")}>
              {blockedReason}
            </Text>
          )}
        </Flex>
      </TableCell>
      <TableCell sx={{ verticalAlign: "top" }}>
        <Flex direction="column" align="flex-end">
          <Text fs="p4" fw={500}>
            {t("currency", { value: owed, symbol })}
          </Text>
          {/* no price: the amount alone, not a value of zero */}
          {Big(owedUsd).gt(0) && (
            <Text fs="p5" lh={1} color={getToken("text.medium")}>
              {t("currency", { value: owedUsd, maximumFractionDigits: 2 })}
            </Text>
          )}
        </Flex>
      </TableCell>
    </TableRow>
  )
}
