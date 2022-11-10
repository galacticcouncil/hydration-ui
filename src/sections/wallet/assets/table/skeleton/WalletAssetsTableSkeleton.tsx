import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { useAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton.utils"

export const WalletAssetsTableSkeleton = () => {
  const { t } = useTranslation()
  const table = useAssetsTableSkeleton()

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.assets.table.title")}
      css={assetsTableStyles}
    />
  )
}
