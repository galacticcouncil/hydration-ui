import { Grid, SectionHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { WalletRewardsSection } from "@/modules/wallet/assets/Rewards/WalletRewardsSection"

export const WalletRewards: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Grid rowTemplate="auto 1fr">
      <SectionHeader title={t("rewards.title")} />
      <WalletRewardsSection />
    </Grid>
  )
}
