import { Grid, SectionHeader, Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { NetWorth } from "@/modules/wallet/assets/Balances/NetWorth"
import { SWalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances.styled"
import { WalletBalancesSection } from "@/modules/wallet/assets/Balances/WalletBalancesSection"

export const WalletBalances: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Grid rowTemplate="auto 1fr">
      <SectionHeader title={t("balances.title")} />
      <SWalletBalances>
        <NetWorth />
        <Separator
          mt={8}
          orientation="vertical"
          display={["none", null, "initial"]}
        />
        <Separator mt={8} display={["initial", null, "none"]} />
        <WalletBalancesSection />
      </SWalletBalances>
    </Grid>
  )
}
