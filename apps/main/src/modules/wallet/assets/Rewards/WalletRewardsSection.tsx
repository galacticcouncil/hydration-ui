import { Button, ValueStats } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import {
  SWalletRewardsActionItem,
  SWalletRewardsSection,
} from "@/modules/wallet/assets/Rewards/WalletRewardsSection.styled"

// TODO wallet rewards
export const WalletRewardsSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const [totalRewards] = useDisplayAssetPrice("10", 14143000)

  return (
    <SWalletRewardsSection separated>
      <ValueStats
        alwaysWrap
        size="medium"
        label={t("rewards.allocated")}
        value={`${t("common:number", { value: 200000 })} HDX`}
      />
      <SWalletRewardsActionItem>
        <ValueStats
          alwaysWrap
          size="medium"
          label={t("rewards.claimable")}
          value={`${t("common:number", { value: 15000 })} HDX`}
        />
        <Button size="medium" variant="tertiary" asChild>
          <Link to="/staking">{t("rewards.goToStaking")}</Link>
        </Button>
      </SWalletRewardsActionItem>
      <SWalletRewardsActionItem>
        <ValueStats
          alwaysWrap
          size="medium"
          label={t("rewards.total")}
          value={totalRewards}
        />
        {/* TODO wallet rewards claim */}
        <Button size="medium">{t("common:claim")}</Button>
      </SWalletRewardsActionItem>
    </SWalletRewardsSection>
  )
}
