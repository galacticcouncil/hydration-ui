import { Grid, SectionHeader, Separator } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { NetWorth } from "@/modules/wallet/Balances/NetWorth"
import { WalletBalancesSection } from "@/modules/wallet/Balances/WalletBalancesSection"

export const WalletBalances: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Grid sx={{ gridTemplateRows: "auto 1fr" }}>
      <SectionHeader>{t("balances.title")}</SectionHeader>
      <Grid
        height={292}
        p={20}
        gap={20}
        borderRadius={16}
        borderWidth={1}
        borderStyle="solid"
        borderColor={getToken("details.borders")}
        bg={getToken("surfaces.containers.high.primary")}
        sx={{ gridTemplateColumns: "1fr auto minmax(25%, auto)" }}
      >
        <NetWorth />
        <Separator orientation="vertical" />
        <WalletBalancesSection />
      </Grid>
    </Grid>
  )
}
