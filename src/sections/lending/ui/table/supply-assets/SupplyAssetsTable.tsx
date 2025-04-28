import { useNavigate } from "@tanstack/react-location"
import {
  DataTable,
  TableAction,
  TableContainer,
  TableTitle,
  TableTitleContainer,
} from "components/DataTable"
import { Modal } from "components/Modal/Modal"
import { Switch } from "components/Switch/Switch"
import { useReactTable } from "hooks/useReactTable"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useLocalStorageBool } from "sections/lending/hooks/useLocalStorageBool"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { SupplyAssetModal } from "sections/lending/ui/table/supply-assets/SupplyAssetModal"
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
import { SupplyGigadotRow } from "sections/lending/ui/table/supply-assets/SupplyGigadotRow"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { NewDepositFormWrapper } from "sections/wallet/strategy/NewDepositForm/NewDepositFormWrapper"
import { useRpcProvider } from "providers/rpcProvider"
import { useNewDepositDefaultAssetId } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"

export const SupplyAssetsTable = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { featureFlags } = useRpcProvider()

  const { currentMarket } = useProtocolDataContext()
  const [showAll, setShowAll] = useLocalStorageBool("showAllSupplyAssets")
  const [supplyModal, setSupplyModal] = useState("")

  const { account } = useAccount()

  const { data, isLoading } = useSupplyAssetsTableData({ showAll })
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

  const defaultAssetId = useNewDepositDefaultAssetId()

  return (
    <TableContainer background={supplyAssetsTableBackground}>
      <TableTitleContainer
        spacing={supplyAssetsTableSpacing}
        customContainer={featureFlags.strategies}
      >
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
      {featureFlags.strategies && (
        <SupplyGigadotRow isLoading={isLoading} onOpenSupply={setSupplyModal} />
      )}
      <DataTable
        css={
          !featureFlags.strategies || !isDesktop
            ? { "&": { borderTop: "none" } }
            : undefined
        }
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
      {defaultAssetId && (
        <Modal open={!!supplyModal} onClose={() => setSupplyModal("")}>
          <NewDepositFormWrapper defaultAssetId={defaultAssetId}>
            <SupplyAssetModal
              assetId={supplyModal}
              assetsBlacklist={assetsBlacklist[supplyModal] ?? []}
              onClose={() => setSupplyModal("")}
            />
          </NewDepositFormWrapper>
        </Modal>
      )}
    </TableContainer>
  )
}

const assetsBlacklist: Record<string, ReadonlyArray<string>> = {
  [GDOT_ERC20_ASSET_ID]: [GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID],
  [GDOT_STABLESWAP_ASSET_ID]: [GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID],
}
