import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Box, Paper, SectionHeader } from "@galacticcouncil/ui/components"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { Balances } from "@/modules/balances/Balances"

export const BalancesPage: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { account } = useAccount()

  if (!account) {
    return (
      <Box>
        <SectionHeader noTopPadding title="Balances" />
        <Paper py="5.75rem">
          <EmptyState
            image={NoFunds}
            header={t("wallet:emptyState.title")}
            description={t("wallet:emptyState.description")}
            action={<Web3ConnectButton variant="secondary" />}
          />
        </Paper>
      </Box>
    )
  }

  return <Balances key={account.address} address={account.address} />
}
