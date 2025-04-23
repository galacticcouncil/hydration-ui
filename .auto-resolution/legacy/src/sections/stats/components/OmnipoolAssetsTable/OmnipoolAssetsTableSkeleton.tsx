import { TableStatsSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { Table } from "@tanstack/react-table"

type Props = { table: Table<unknown> }

export const OmnipoolAssetsTableSkeleton = ({ table }: Props) => {
  const { t } = useTranslation()

  return (
    <TableStatsSkeleton
      table={table}
      title={t("stats.overview.table.assets.header.title")}
    />
  )
}
