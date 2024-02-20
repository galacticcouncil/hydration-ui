import {
  VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"
import { useMedia } from "react-use"
import { theme } from "theme"
import { TUseOmnipoolAssetDetailsData } from "sections/stats/StatsPage.utils"
import BigNumber from "bignumber.js"

export type OmnipoolAssetsTableColumn = ColumnDef<
  TUseOmnipoolAssetDetailsData[number],
  string & BigNumber
>

export const useOmnipoolAssetsTable = (
  data: TUseOmnipoolAssetDetailsData,
  columns: OmnipoolAssetsTableColumn[],
) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    symbol: true,
    tvl: true,
    volume: isDesktop,
    fee: isDesktop,
    apy: isDesktop,
    pol: isDesktop,
    price: isDesktop,
    treasury: true,
    actions: true,
  }

  return useReactTable({
    data,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
