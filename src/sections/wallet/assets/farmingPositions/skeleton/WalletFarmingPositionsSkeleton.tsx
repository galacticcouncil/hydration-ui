import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { useFarmingPositionsSkeleton } from "./WalletFarmingPositionsSkeleton.utils"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"

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
