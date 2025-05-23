import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { LendingHistoryPlaceholder } from "@/modules/borrow/history/LendingHistoryPlaceholder"
import { LendingHistorySearch } from "@/modules/borrow/history/LendingHistorySearch"
import { LendingHistoryTable } from "@/modules/borrow/history/LendingHistoryTable"

export const LendingHistoryPage = () => {
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()

  const [searchPhrase, setSearchPhrase] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  if (!account?.address) {
    return <LendingHistoryPlaceholder />
  }

  return (
    <Flex direction="column" gap={10}>
      <Flex
        direction={["column", "row"]}
        justify="space-between"
        align={["flex-start", "center"]}
      >
        <SectionHeader>{t("borrow:history.table.title")}</SectionHeader>
        <LendingHistorySearch
          onChange={(searchPhrase) => {
            setSearchPhrase(searchPhrase)
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
          }}
        />
      </Flex>
      <LendingHistoryTable
        searchPhrase={searchPhrase}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </Flex>
  )
}
