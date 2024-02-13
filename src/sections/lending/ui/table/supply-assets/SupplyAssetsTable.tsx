import { DataTable } from "components/DataTable"
import { Switch } from "components/Switch/Switch"
import { useReactTable } from "hooks/useReactTable"
import { useTranslation } from "react-i18next"
import { useLocalStorageBool } from "sections/lending/hooks/useLocalStorageBool"
import {
  useSupplyAssetsTableColumns,
  useSupplyAssetsTableData,
} from "sections/lending/ui/table/supply-assets/SupplyAssetsTable.utils"

export const SupplyAssetsTable = () => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useLocalStorageBool("showSupplyAssets")

  const { data, isLoading } = useSupplyAssetsTableData({ showAll })
  const columns = useSupplyAssetsTableColumns()

  const table = useReactTable({
    data,
    columns,
    isLoading,
    skeletonRowCount: 6,
  })

  const hasAvailableDeposits =
    data.filter((reserve) => reserve.availableToDepositUSD !== "0")?.length >= 1

  return (
    <DataTable
      table={table}
      spacing="large"
      title="Assets to supply"
      action={
        hasAvailableDeposits && (
          <Switch
            value={showAll}
            onCheckedChange={setShowAll}
            size="small"
            name="showAll"
            label={t("wallet.assets.table.toggle")}
          />
        )
      }
    />
  )
}
