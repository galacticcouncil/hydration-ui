import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"
import { useShallowCompareEffect } from "react-use"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { BorrowHistoryPlaceholder } from "@/modules/money-market/history/BorrowHistoryPlaceholder"
import { BorrowHistorySearch } from "@/modules/money-market/history/BorrowHistorySearch"
import { BorrowHistoryTable } from "@/modules/money-market/history/BorrowHistoryTable"

export const BorrowHistoryPage = () => {
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()
  const accountAddress = account?.address

  const paginationProps = useDataTableUrlPagination(
    "/borrow/history",
    "page",
    20,
  )

  useShallowCompareEffect(() => {
    paginationProps.onPageClick(1)
  }, [accountAddress])

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
      <BorrowHistorySearch
        title={t("borrow:history.table.title")}
        searchPhrase={searchPhrase}
        onChange={setSearchPhrase}
      />

      <BorrowHistoryTable
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
      />
    </>
  )
}
