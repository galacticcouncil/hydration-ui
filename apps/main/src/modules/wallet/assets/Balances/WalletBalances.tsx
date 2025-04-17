import { Grid, SectionHeader, Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { NetWorth } from "@/modules/wallet/assets/Balances/NetWorth"
import { SWalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances.styled"
import { WalletBalancesSection } from "@/modules/wallet/assets/Balances/WalletBalancesSection"

export const WalletBalances: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Grid height="100%" sx={{ gridTemplateRows: "auto 1fr" }}>
      <SectionHeader>{t("balances.title")}</SectionHeader>
      <SWalletBalances>
        <NetWorth />
        <Separator orientation="vertical" display={["none", "initial"]} />
        <Separator display={["initial", "none"]} />
        <WalletBalancesSection />
      </SWalletBalances>
    </Grid>
  )
}
