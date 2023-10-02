import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import BN from "bignumber.js"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletAssetsHydraPositionsDetails } from "./details/WalletAssetsHydraPositionsDetails"
import { AssetTableName } from "components/AssetTableName/AssetTableName"

export const useHydraPositionsTable = (data: HydraPositionsTableData[]) => {
  const { t } = useTranslation()
  const { accessor } = createColumnHelper<HydraPositionsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "name",
        header: t("wallet.assets.hydraPositions.header.name"),
        cell: ({ row }) => (
          <AssetTableName {...row.original} id={row.original.assetId} />
        ),
      }),
      accessor("providedAmount", {
        id: "providedAmount",
        header: t("wallet.assets.hydraPositions.header.providedAmount"),
        sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
        cell: ({ row }) => (
          <WalletAssetsHydraPositionsDetails
            assetId={row.original.assetId}
            symbol={row.original.symbol}
            amount={row.original.providedAmountShifted}
            amountDisplay={row.original.providedAmountDisplay}
          />
        ),
      }),
      accessor("valueDisplay", {
        id: "valueDisplay",
        header: t("wallet.assets.hydraPositions.header.valueUSD"),
        sortingFn: (a, b) =>
          b.original.valueDisplay.isNaN()
            ? 1
            : a.original.valueDisplay.gt(b.original.valueDisplay)
            ? 1
            : -1,
        cell: ({ row }) => (
          <WalletAssetsHydraPositionsDetails
            assetId={row.original.assetId}
            symbol={row.original.symbol}
            lrna={row.original.lrna}
            amount={row.original.value}
            amountDisplay={row.original.valueDisplay}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}

export type HydraPositionsTableData = {
  id: string
  assetId: string
  symbol: string
  name: string
  lrna: BN
  value: BN
  valueDisplay: BN
  price: BN
  providedAmount: BN
  providedAmountDisplay: BN
  providedAmountShifted: BN
  shares: BN
}
