import { useNavigate } from "@tanstack/react-location"
import { Alert } from "components/Alert/Alert"
import { DataTable } from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { BorrowAssetsMobileRow } from "sections/lending/ui/table/borrow-assets/BorrowAssetsMobileRow"
import {
  useBorrowAssetsTableColumns,
  useBorrowAssetsTableData,
} from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"

export const BorrowAssetsTable = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentMarket } = useProtocolDataContext()
  const { data, isLoading } = useBorrowAssetsTableData()
  const columns = useBorrowAssetsTableColumns()

  const { account } = useAccount()

  const table = useReactTable({
    data,
    columns,
    isLoading,
    skeletonRowCount: 6,
  })

  const { user } = useAppDataContext()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <DataTable
      table={table}
      spacing="large"
      title={t("lending.borrow.table.title")}
      renderRow={isDesktop ? undefined : BorrowAssetsMobileRow}
      hoverable
      onRowClick={(row) => {
        navigate({
          to: ROUTES.reserveOverview(
            row.original.underlyingAsset,
            currentMarket,
          ),
        })
      }}
      addons={
        account &&
        user?.totalCollateralMarketReferenceCurrency === "0" && (
          <Alert variant="info">
            <Text fs={13}>{t("lending.borrow.table.alert")}</Text>
          </Alert>
        )
      }
    />
  )
}
