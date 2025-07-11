import { useNavigate } from "@tanstack/react-location"
import {
  DataTable,
  TableAction,
  TableContainer,
  TableTitle,
  TableTitleContainer,
} from "components/DataTable"
import { Switch } from "components/Switch/Switch"
import { useReactTable } from "hooks/useReactTable"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useLocalStorageBool } from "sections/lending/hooks/useLocalStorageBool"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { SupplyAssetsMobileRow } from "sections/lending/ui/table/supply-assets/SupplyAssetsMobileRow"
import {
  supplyAssetsTableBackground,
  supplyAssetsTableSize,
  supplyAssetsTableSpacing,
} from "sections/lending/ui/table/supply-assets/SupplyAssetsTable.constants"
import {
  useSupplyAssetsTableColumns,
  useSupplyAssetsTableData,
} from "sections/lending/ui/table/supply-assets/SupplyAssetsTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { SupplyGigaRow } from "sections/lending/ui/table/supply-assets/SupplyGigaRow"
import { Separator } from "components/Separator/Separator"
import { Fragment } from "react"

export const SupplyAssetsTable = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { currentMarket } = useProtocolDataContext()
  const [showAll, setShowAll] = useLocalStorageBool("showAllSupplyAssets")

  const { account } = useAccount()

  const { data, gigaReserves, isLoading } = useSupplyAssetsTableData({
    showAll,
  })
  const columns = useSupplyAssetsTableColumns()

  const table = useReactTable({
    data,
    columns,
    isLoading,
    skeletonRowCount: 6,
  })

  const hasAvailableDeposits =
    !!account &&
    data.filter((reserve) => reserve.availableToDepositUSD !== "0")?.length >= 1

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <TableContainer background={supplyAssetsTableBackground}>
      <TableTitleContainer spacing={supplyAssetsTableSpacing} customContainer>
        <TableTitle>{t("lending.supply.table.title")}</TableTitle>
        {hasAvailableDeposits && (
          <TableAction
            css={{ position: "absolute" }}
            sx={{ right: [10, 20], top: 20 }}
          >
            <Switch
              value={showAll}
              onCheckedChange={setShowAll}
              name="showAll"
              label={t("wallet.assets.table.toggle")}
            />
          </TableAction>
        )}
      </TableTitleContainer>
      {gigaReserves.map((gigaReserve, index, arr) => (
        <Fragment key={gigaReserve.id}>
          <SupplyGigaRow isLoading={isLoading} reserve={gigaReserve} />
          {arr.length > index + 1 && (
            <Separator sx={{ display: ["none", "block"] }} />
          )}
        </Fragment>
      ))}
      <DataTable
        css={!isDesktop ? { "&": { borderTop: "none" } } : undefined}
        table={table}
        spacing={supplyAssetsTableSpacing}
        size={supplyAssetsTableSize}
        background={supplyAssetsTableBackground}
        customContainer
        renderRow={isDesktop ? undefined : SupplyAssetsMobileRow}
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
