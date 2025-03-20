import { css } from "@emotion/react"
import { useNavigate } from "@tanstack/react-location"
import { Alert } from "components/Alert/Alert"
import {
  DataTable,
  TableAddons,
  TableContainer,
  TableTitle,
  TableTitleContainer,
} from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { BorrowAssetsMobileRow } from "sections/lending/ui/table/borrow-assets/BorrowAssetsMobileRow"
import {
  useBorrowAssetsTableColumns,
  useBorrowAssetsTableData,
} from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { groupBy } from "utils/rx"

export const BorrowAssetsTable = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const displayGho = useRootStore((state) => state.displayGho)
  const { currentMarket } = useProtocolDataContext()
  const { ghoEnabled } = useAppDataContext()
  const { data, isLoading } = useBorrowAssetsTableData()
  const { account } = useAccount()

  const { hollar = [], assets = [] } = useMemo(() => {
    return groupBy(data, (reserve) =>
      displayGho({ symbol: reserve.symbol, currentMarket })
        ? "hollar"
        : "assets",
    )
  }, [currentMarket, data, displayGho])

  const assetsColumns = useBorrowAssetsTableColumns()
  const hollarColumns = useBorrowAssetsTableColumns({ isGho: true })

  const hollarTable = useReactTable({
    data: hollar,
    columns: hollarColumns,
    isLoading,
    skeletonRowCount: 6,
  })

  const assetsTable = useReactTable({
    data: assets,
    columns: assetsColumns,
    isLoading,
    skeletonRowCount: 6,
  })

  const { user } = useAppDataContext()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <TableContainer background="darkBlue700">
      <TableTitleContainer spacing="large">
        <TableTitle>{t("lending.borrow.table.title")}</TableTitle>
      </TableTitleContainer>
      {account && user?.totalCollateralMarketReferenceCurrency === "0" && (
        <TableAddons spacing="large">
          <Alert variant="info" size="small">
            <Text fs={13}>{t("lending.borrow.table.alert")}</Text>
          </Alert>
        </TableAddons>
      )}
      {ghoEnabled && (
        <DataTable
          css={css`
            --border-color: transparent;
          `}
          fixedLayout
          background="transparent"
          table={hollarTable}
          spacing="large"
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
        />
      )}

      <DataTable
        css={css`
          --border-color: transparent;
        `}
        fixedLayout
        background="transparent"
        table={assetsTable}
        spacing="large"
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
      />
    </TableContainer>
  )
}
