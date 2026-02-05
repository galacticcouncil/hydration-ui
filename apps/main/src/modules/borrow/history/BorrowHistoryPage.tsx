import { SectionHeader } from "@galacticcouncil/ui/components"
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

  const paginationProps = useDataTableUrlPagination(
    "/borrow/history",
    "page",
    10,
  )

  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/borrow/history",
    "search",
    {
      onChange: () => paginationProps.onPageClick(1),
    },
  )

  if (!account) {
    return <BorrowHistoryPlaceholder />
  }

  return (
    <>
      <SectionHeader
        noTopPadding
        title={t("borrow:history.table.title")}
        actions={
          <BorrowHistorySearch
            searchPhrase={searchPhrase}
            onChange={setSearchPhrase}
          />
        }
      />
      <BorrowHistoryTable
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
      />
    </>
  )
}
