import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { useAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton.utils"
import { useMedia } from "react-use"
import { theme } from "theme"

export const WalletAssetsTableSkeleton = () => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const table = useAssetsTableSkeleton()

  return (
    <TableSkeleton
      table={table}
      title={
        isDesktop ? t("wallet.assets.table.title") : t("wallet.header.assets")
      }
      css={assetsTableStyles}
    />
  )
}
