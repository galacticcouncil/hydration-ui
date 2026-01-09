import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Flex, Paper, SectionHeader } from "@galacticcouncil/ui/components"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

export const BorrowHistoryPlaceholder: FC = () => {
  const { t } = useTranslation(["borrow"])

  return (
    <Flex direction="column" gap={10}>
      <SectionHeader title={t("history.table.title")} />
      <Paper py={93}>
        <EmptyState
          image={NoFunds}
          header={t("emptyState.title")}
          description={t("emptyState.description")}
          action={<Web3ConnectButton variant="secondary" />}
        />
      </Paper>
    </Flex>
  )
}
