import { useAccountTransfers } from "api/wallet"
import { useCallback, useMemo, useState } from "react"
import { useWalletTransactionsFilters } from "sections/wallet/transactions/WalletTransactions.utils"
import { arraySearch } from "utils/helpers"

const PER_PAGE = 10

export const useTransactionsTableData = (address: string) => {
  const { data, isInitialLoading } = useAccountTransfers(address)
  const [page, setPage] = useState(0)

  const { type, search } = useWalletTransactionsFilters()

  const filteredData = useMemo(() => {
    if (!data) return []
    const byType = type === "all" ? data : data.filter((tx) => tx.type === type)

    const bySearch = search
      ? arraySearch(byType, search, [
          "assetSymbol",
          "assetName",
          "source",
          "sourceDisplay",
          "dest",
          "destDisplay",
        ])
      : byType

    return bySearch.slice(0, (page + 1) * PER_PAGE)
  }, [data, page, search, type])

  const setNextPage = useCallback(() => setPage((prev) => prev + 1), [setPage])
  const hasNextPage = filteredData.length >= PER_PAGE * (page + 1)

  return {
    data: data ?? [],
    filteredData,
    isLoading: isInitialLoading,
    setNextPage,
    hasNextPage,
  }
}

export type TTransactionsTable = typeof useTransactionsTableData
export type TTransactionsTableData = ReturnType<TTransactionsTable>["data"]
