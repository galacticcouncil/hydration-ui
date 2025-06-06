import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { BorrowHistoryPlaceholder } from "@/modules/borrow/history/BorrowHistoryPlaceholder"
import { BorrowHistorySearch } from "@/modules/borrow/history/BorrowHistorySearch"
import { BorrowHistoryTable } from "@/modules/borrow/history/BorrowHistoryTable"

export const BorrowHistoryPage = () => {
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()

  const [searchPhrase, setSearchPhrase] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  if (!account?.address) {
    return <BorrowHistoryPlaceholder />
  }

  return (
    <Flex direction="column" gap={10}>
      <Flex
        direction={["column", "row"]}
        justify="space-between"
        align={["flex-start", "center"]}
      >
        <SectionHeader>{t("borrow:history.table.title")}</SectionHeader>
        <BorrowHistorySearch
          onChange={(searchPhrase) => {
            setSearchPhrase(searchPhrase)
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
          }}
        />
      </Flex>
      <BorrowHistoryTable
        searchPhrase={searchPhrase}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </Flex>
  )
}
