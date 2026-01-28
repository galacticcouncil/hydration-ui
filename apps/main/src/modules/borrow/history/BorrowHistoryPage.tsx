import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { BorrowHistoryPlaceholder } from "@/modules/borrow/history/BorrowHistoryPlaceholder"
import { BorrowHistorySearch } from "@/modules/borrow/history/BorrowHistorySearch"
import { BorrowHistoryTable } from "@/modules/borrow/history/BorrowHistoryTable"

export const BorrowHistoryPage = () => {
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()

  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/borrow/history",
    "search",
  )

  const paginationProps = useDataTableUrlPagination(
    "/borrow/history",
    "page",
    10,
  )

  if (!account) {
    return <BorrowHistoryPlaceholder />
  }

  return (
    <Flex direction="column" gap={10}>
      <Flex
        direction={["column", "row"]}
        justify="space-between"
        align={["flex-start", "center"]}
      >
        <SectionHeader title={t("borrow:history.table.title")} />
        <BorrowHistorySearch
          searchPhrase={searchPhrase}
          onChange={(searchPhrase) => {
            setSearchPhrase(searchPhrase)
            paginationProps.onPageClick(1)
          }}
        />
      </Flex>
      <BorrowHistoryTable
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
      />
    </Flex>
  )
}
