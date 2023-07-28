import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { assetsTableStyles } from "../../table/WalletAssetsTable.styled"
import { useFarmingPositionsSkeleton } from "./WalletFarmingPositionsSkeleton.utils"

export const WalletFarmingPositionsSkeleton = () => {
  const { t } = useTranslation()
  const table = useFarmingPositionsSkeleton()

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.assets.farmingPositions.title")}
      css={assetsTableStyles}
    />
  )
}
