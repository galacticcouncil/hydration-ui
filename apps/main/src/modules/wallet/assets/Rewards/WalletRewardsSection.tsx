import { Button, Flex, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useWalletRewardsSectionData } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.data"
import { SWalletRewardsSection } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.styled"
import { WalletRewardsSectionEmpty } from "@/modules/wallet/assets/Rewards/WalletRewardsSectionEmpty"
import { USDT_ASSET_ID } from "@/utils/consts"

export const WalletRewardsSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const { incentives, farming, staking, referral, isEmpty, isLoading } =
    useWalletRewardsSectionData()

  const [incentivesDisplay] = useDisplayAssetPrice(
    USDT_ASSET_ID,
    incentives.value,
  )

  const [farmingDisplay] = useDisplayAssetPrice(USDT_ASSET_ID, farming.value)

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
          value={t("common:currency", {
            value: referral.value,
            symbol: referral.symbol,
          })}
          isLoading={referral.loading}
        />
        {referral.isEmpty && !referral.loading && (
          <WalletRewardsSectionEmpty link="/referrals">
            {t("rewards.referrals.empty")}
          </WalletRewardsSectionEmpty>
        )}
      </Flex>
      {/* TODO wallet rewards claim */}
      <Button width="max-content" disabled={isEmpty}>
        {isEmpty && !isLoading ? t("rewards.claim.empty") : t("rewards.claim")}
      </Button>
    </SWalletRewardsSection>
  )
}
