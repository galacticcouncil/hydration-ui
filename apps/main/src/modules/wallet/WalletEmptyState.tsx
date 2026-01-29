import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Box, Paper, SectionHeader } from "@galacticcouncil/ui/components"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

export const WalletEmptyState: FC = () => {
  const { t } = useTranslation(["wallet"])

  return (
    <Box>
      <SectionHeader noTopPadding title={t("wallet:myAssets.header.title")} />
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
