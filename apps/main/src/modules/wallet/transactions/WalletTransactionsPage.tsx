import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Input, SectionHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { WalletTransactionsTable } from "@/modules/wallet/transactions/WalletTransactionsTable"

export const WalletTransactionsPage = () => {
  const { t } = useTranslation("wallet")
  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/wallet/transactions",
    "search",
  )

  return (
    <div>
      <Flex justify="space-between" align="center">
        <SectionHeader title={t("transactions.header.title")} />
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
