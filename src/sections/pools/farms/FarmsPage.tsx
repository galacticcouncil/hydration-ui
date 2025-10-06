import { DataTable } from "components/DataTable"
import { PageHeading } from "components/Layout/PageHeading"
import { useReactTable } from "hooks/useReactTable"
import {
  useFarmsTableColumns,
  useFarmsTableData,
} from "sections/pools/farms/FarmsPage.utils"

export const FarmsPage = () => {
  const { data, isLoading } = useFarmsTableData("ongoing")
  const columns = useFarmsTableColumns()

  const table = useReactTable({
    data,
    columns,
    isLoading,
    columnsHiddenOnMobile: [
      "fullness",
      "estimatedEndBlock",
      "apr",
      "diffRewards",
      "rewardCurrency",
    ],
  })

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <PageHeading>Farms</PageHeading>
      <DataTable table={table} />
    </div>
  )
}
