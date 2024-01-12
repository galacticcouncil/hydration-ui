import { useAccountTransfers } from "api/wallet"

export const useTransactionsTableData = (address: string) => {
  const { data, isInitialLoading } = useAccountTransfers(address)

  return { data: data ?? [], isLoading: isInitialLoading }
}

export type TTransactionsTable = typeof useTransactionsTableData
export type TTransactionsTableData = ReturnType<TTransactionsTable>["data"]
