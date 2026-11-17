import {
  Flex,
  LoadingButton,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useGigaAccountBalance } from "@/api/gigaStake"
import { useRewardsDistributorAccrued } from "@/api/rewardsDistributor"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { DistributorAccruedRewards } from "@/components/DistributorAccruedRewards/DistributorAccruedRewards"
import { LINKS } from "@/config/navigation"
import { useClaimAllWalletRewards } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.claim"
import { useWalletRewardsSectionData } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.data"
import { SWalletRewardsSection } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.styled"
import { WalletRewardsSectionEmpty } from "@/modules/portfolio/overview/Rewards/WalletRewardsSectionEmpty"

export const WalletRewardsSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { data: gigaHdxBalance } = useGigaAccountBalance()
  const balance = gigaHdxBalance?.free ?? 0n

  const { incentives, farming, staking, referral, isEmpty, isLoading } =
    useWalletRewardsSectionData()

  const claimAll = useClaimAllWalletRewards()
  const distributorAccrued = useRewardsDistributorAccrued()

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
    <SWalletRewardsSection gap="base" separated>
      {/* one child, so no separator comes between the row and its lines */}
      <Flex direction="column" gap="s">
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
        {/* not claimable yet, so not in the value above nor in "claim all" */}
        <DistributorAccruedRewards
          stages={distributorAccrued.stages}
          symbol={distributorAccrued.symbol}
        />
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
        {balance === 0n && (
          <WalletRewardsSectionEmpty link={LINKS.stakingGigaStake}>
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
      </Flex>
      <Flex justify="space-between" align="center" mt="base">
        <LoadingButton
          isLoading={claimAll.isPending}
          width="max-content"
          disabled={isEmpty}
          onClick={() => claimAll.mutate()}
        >
          {isEmpty && !isLoading
            ? t("rewards.claim.empty")
            : t("rewards.claim")}
        </LoadingButton>
        <Text fs={pxToRem(9)} lh={1} color={getToken("text.low")}>
          {t("rewards.claim.description")}
        </Text>
      </Flex>
    </SWalletRewardsSection>
  )
}
