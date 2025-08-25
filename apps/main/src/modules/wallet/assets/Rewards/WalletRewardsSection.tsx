import { Button, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SWalletRewardsSection } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.styled"
import { USDT_ASSET_ID } from "@/utils/consts"

// TODO integrate wallet rewards
export const WalletRewardsSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const [incentives] = useDisplayAssetPrice(USDT_ASSET_ID, 60)
  const [farmingRewards] = useDisplayAssetPrice(USDT_ASSET_ID, 424)

  return (
    <SWalletRewardsSection separated>
      <ValueStats
        wrap
        size="medium"
        label={t("rewards.incentives")}
        value={incentives}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("rewards.farmingRewards")}
        value={farmingRewards}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("rewards.allocated")}
        value={t("common:currency", { value: 15000, symbol: "HDX" })}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("rewards.referrals")}
        value={t("common:currency", { value: 300, symbol: "HDX" })}
      />
      {/* TODO wallet rewards claim */}
      <Button width="max-content">{t("rewards.claim")}</Button>
    </SWalletRewardsSection>
  )
}
