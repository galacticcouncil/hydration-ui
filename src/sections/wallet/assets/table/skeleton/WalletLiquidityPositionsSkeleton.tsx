import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { useAssetsTableSkeleton } from "./WalletAssetsTableSkeleton.utils"

export const WalletLiquidityPositionsSkeleton = () => {
  const { t } = useTranslation()
  const table = useAssetsTableSkeleton()

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.assets.liquidityPositions.table.title")}
      css={assetsTableStyles}
    />
  )
}
