import { SectionHeader } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"
import { useShallowCompareEffect } from "react-use"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { BorrowHistoryPlaceholder } from "@/modules/borrow/history/BorrowHistoryPlaceholder"
import { BorrowHistorySearch } from "@/modules/borrow/history/BorrowHistorySearch"
import { BorrowHistoryTable } from "@/modules/borrow/history/BorrowHistoryTable"

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
      <SectionHeader
        noTopPadding
        title={t("borrow:history.table.title")}
        actions={
          <BorrowHistorySearch
            searchPhrase={searchPhrase}
            onChange={setSearchPhrase}
          />
        }
        sx={{
          flexDirection: ["column-reverse", "row"],
          gap: ["xl", 0],
          alignItems: ["flex-start", "center"],
        }}
      />

      <BorrowHistoryTable
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
      />
    </>
  )
}
