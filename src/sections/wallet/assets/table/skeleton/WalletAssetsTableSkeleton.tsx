import { useAssetsTableSkeleton } from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"

export const WalletAssetsTableSkeleton = () => {
  const { t } = useTranslation()
  const table = useAssetsTableSkeleton()

  return <TableSkeleton table={table} title={t("wallet.assets.table.title")} />
}
