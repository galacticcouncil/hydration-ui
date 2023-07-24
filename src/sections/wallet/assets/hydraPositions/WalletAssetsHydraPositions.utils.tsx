import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletAssetsHydraPositionsActions } from "sections/wallet/assets/hydraPositions/actions/WalletAssetsHydraPositionsActions"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { WalletAssetsTableName } from "sections/wallet/assets/table/data/WalletAssetsTableData"
import { WalletAssetsHydraPositionsDetails } from "./details/WalletAssetsHydraPositionsDetails"

export const useHydraPositionsTable = (data: HydraPositionsTableData[]) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<HydraPositionsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    accessor("symbol", {
      id: "name",
      header: t("wallet.assets.hydraPositions.header.name"),
      cell: ({ row }) => <WalletAssetsTableName {...row.original} />,
    }),
    accessor("providedAmount", {
      id: "providedAmount",
      header: t("wallet.assets.hydraPositions.header.providedAmount"),
      sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
      cell: ({ row }) => (
        <WalletAssetsHydraPositionsDetails
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
          symbol={row.original.symbol}
          lrna={row.original.lrna}
          amount={row.original.value}
          amountDisplay={row.original.valueDisplay}
        />
      ),
    }),
    display({
      id: "actions",
      cell: () => <WalletAssetsHydraPositionsActions />,
    }),
  ]

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
