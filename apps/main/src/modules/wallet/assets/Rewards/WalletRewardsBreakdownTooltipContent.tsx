import { Flex, Skeleton, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useWalletRewardsSectionData } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.data"

type BreakdownRowProps = {
  label: string
  value: ReactNode
  isLoading?: boolean
}

const BreakdownRow: FC<BreakdownRowProps> = ({ label, value, isLoading }) => (
  <Flex justify="space-between" align="center" gap="l">
    <Text fs="p6" fw={500} lh={1.4} color={getToken("text.medium")}>
      {label}
    </Text>
    {isLoading ? (
      <Skeleton width="4rem" height="1em" />
    ) : (
      <Text fs="p6" fw={600} lh={1.4} color={getToken("text.high")}>
        {value}
      </Text>
    )}
  </Flex>
)

export const WalletRewardsBreakdownTooltipContent: FC = () => {
  const { t } = useTranslation("wallet")

  const { incentives, farming, referral } = useWalletRewardsSectionData()

  const [incentivesDisplay, { isLoading: incentivesLoading }] =
    useDisplayAssetPrice(incentives.assetId, incentives.value)

  const [farmingDisplay, { isLoading: farmingLoading }] = useDisplayAssetPrice(
    farming.assetId,
    farming.value,
  )

  const [referralsDisplay, { isLoading: referralLoading }] =
    useDisplayAssetPrice(referral.assetId, referral.value)

  return (
    <Stack gap="s">
      <BreakdownRow
        label={t("rewards.incentives")}
        value={incentivesDisplay}
        isLoading={incentives.loading || incentivesLoading}
      />
      <BreakdownRow
        label={t("rewards.farmingRewards")}
        value={farmingDisplay}
        isLoading={farming.loading || farmingLoading}
      />
      <BreakdownRow
        label={t("rewards.referrals")}
        value={referralsDisplay}
        isLoading={referral.loading || referralLoading}
      />
    </Stack>
  )
}
