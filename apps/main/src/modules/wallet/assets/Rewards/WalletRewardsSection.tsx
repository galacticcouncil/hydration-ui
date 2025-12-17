import { Button, Flex, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useClaimAllWalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.claim"
import { useWalletRewardsSectionData } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.data"
import { SWalletRewardsSection } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.styled"
import { WalletRewardsSectionEmpty } from "@/modules/wallet/assets/Rewards/WalletRewardsSectionEmpty"

export const WalletRewardsSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const { incentives, farming, staking, referral, isEmpty, isLoading } =
    useWalletRewardsSectionData()

  const claimAll = useClaimAllWalletRewards()

  const [incentivesDisplay] = useDisplayAssetPrice(
    incentives.assetId,
    incentives.value,
  )

  const [farmingDisplay] = useDisplayAssetPrice(farming.assetId, farming.value)

  const [referralsDisplay] = useDisplayAssetPrice(
    referral.assetId,
    referral.value,
  )

  return (
    <SWalletRewardsSection separated>
      <Flex justify="space-between" align="center">
        <ValueStats
          wrap
          size="medium"
          label={t("rewards.incentives")}
          value={incentivesDisplay}
          isLoading={incentives.loading}
        />
        {incentives.isEmpty && !incentives.loading && (
          <WalletRewardsSectionEmpty link="/borrow">
            {t("rewards.incentives.empty")}
          </WalletRewardsSectionEmpty>
        )}
      </Flex>
      <Flex justify="space-between" align="center">
        <ValueStats
          wrap
          size="medium"
          label={t("rewards.farmingRewards")}
          value={farmingDisplay}
          isLoading={farming.loading}
        />
        {farming.isEmpty && !farming.loading && (
          <WalletRewardsSectionEmpty link="/liquidity">
            {t("rewards.farmingRewards.empty")}
          </WalletRewardsSectionEmpty>
        )}
      </Flex>
      <Flex justify="space-between" align="center">
        <ValueStats
          wrap
          size="medium"
          label={t("rewards.allocated")}
          value={t("common:currency", {
            value: staking.value,
            symbol: staking.symbol,
          })}
          isLoading={staking.loading}
        />
        {staking.isEmpty && !staking.loading && (
          <WalletRewardsSectionEmpty link="/staking">
            {t("rewards.allocated.empty")}
          </WalletRewardsSectionEmpty>
        )}
      </Flex>
      <Flex justify="space-between" align="center">
        <ValueStats
          wrap
          size="medium"
          label={t("rewards.referrals")}
          value={referralsDisplay}
          isLoading={referral.loading}
        />
        {referral.isEmpty && !referral.loading && (
          <WalletRewardsSectionEmpty link="/referrals">
            {t("rewards.referrals.empty")}
          </WalletRewardsSectionEmpty>
        )}
      </Flex>
      <Button
        width="max-content"
        disabled={isEmpty}
        onClick={() => claimAll.mutate()}
      >
        {isEmpty && !isLoading ? t("rewards.claim.empty") : t("rewards.claim")}
      </Button>
    </SWalletRewardsSection>
  )
}
