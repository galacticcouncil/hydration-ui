import { Grid, SectionHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { WalletRewardsSection } from "@/modules/wallet/Rewards/WalletRewardsSection"

export const WalletRewards: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Grid sx={{ gridTemplateRows: "auto 1fr" }}>
      <SectionHeader>{t("rewards.title")}</SectionHeader>
      <WalletRewardsSection />
    </Grid>
  )
}
