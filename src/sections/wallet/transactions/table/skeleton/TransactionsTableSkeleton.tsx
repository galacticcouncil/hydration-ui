import { TableStatsSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { useTransactionsTableSkeleton } from "./TransactionsTableSkeleton.utils"

export const TransactionsTableSkeleton = () => {
  const { t } = useTranslation()
  const table = useTransactionsTableSkeleton()

  return (
    <TableStatsSkeleton
      table={table}
      title={t("wallet.transactions.table.header.title")}
      css={{
        backgroundColor: "rgba(6, 9, 23, 0.4);",
      }}
    />
  )
}
