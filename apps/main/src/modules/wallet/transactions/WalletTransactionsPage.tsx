import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Input, SectionHeader } from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { WalletTransactionsTable } from "@/modules/wallet/transactions/WalletTransactionsTable"

export const WalletTransactionsPage = () => {
  const { t } = useTranslation("wallet")
  const [searchPhrase, setSearchPhrase] = useState("")

  return (
    <div>
      <Flex justify="space-between" align="center">
        <SectionHeader>{t("transactions.header.title")}</SectionHeader>
        <Input
          placeholder={t("transactions.search.placeholder")}
          iconStart={Search}
          onChange={(e) => setSearchPhrase(e.target.value)}
        />
      </Flex>
      <WalletTransactionsTable searchPhrase={searchPhrase} />
    </div>
  )
}
