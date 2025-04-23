import { TableStatsSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { useRecentTradesTableSkeleton } from "./RecentTradesTableSkeleton.utils"

export const RecentTradesTableSkeleton = () => {
  const { t } = useTranslation()
  const table = useRecentTradesTableSkeleton()

  return (
    <TableStatsSkeleton
      table={table}
      title={t("stats.overview.table.trades.header.title")}
    />
  )
}
