import { TableStatsSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { useOmnipoolAssetsTableSkeleton } from "./OmnipoolAssetsTableSkeleton.utils"

export const OmnipoolAssetsTableSkeleton = () => {
  const { t } = useTranslation()
  const table = useOmnipoolAssetsTableSkeleton()

  return (
    <TableStatsSkeleton
      table={table}
      title={t("stats.overview.table.assets.header.title")}
    />
  )
}
