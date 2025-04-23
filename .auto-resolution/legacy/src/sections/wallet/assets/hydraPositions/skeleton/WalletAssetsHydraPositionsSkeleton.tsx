import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { useHydraPositionsTableSkeleton } from "sections/wallet/assets/hydraPositions/skeleton/WalletAssetsHydraPositionsSkeleton.utils"

export const WalletAssetsHydraPositionsSkeleton = () => {
  const { t } = useTranslation()
  const table = useHydraPositionsTableSkeleton()

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.assets.hydraPositions.title")}
      css={assetsTableStyles}
    />
  )
}
