import { Button, Separator, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import {
  SWalletRewardsActionItem,
  SWalletRewardsSection,
} from "@/modules/wallet/assets/Rewards/WalletRewardsSection.styled"

export const WalletRewardsSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const [totalRewards] = useDisplayAssetPrice("10", 14143000)

  return (
    <SWalletRewardsSection>
      <ValueStats
        alwaysWrap
        size="medium"
        label={t("rewards.allocated")}
        value={`${t("common:number", { value: 200000 })} HDX`}
      />
      <Separator />
      <SWalletRewardsActionItem>
        <ValueStats
          alwaysWrap
          size="medium"
          label={t("rewards.claimable")}
          value={`${t("common:number", { value: 15000 })} HDX`}
        />
        <Button size="medium" variant="tertiary">
          {t("rewards.goToStaking")}
        </Button>
      </SWalletRewardsActionItem>
      <Separator />
      <SWalletRewardsActionItem>
        <ValueStats
          alwaysWrap
          size="medium"
          label={t("rewards.total")}
          value={totalRewards}
        />
        <Button size="medium">{t("common:claim")}</Button>
      </SWalletRewardsActionItem>
    </SWalletRewardsSection>
  )
}
