import { useTranslation } from "react-i18next"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { WalletAssetsTableName } from "sections/wallet/assets/table/data/WalletAssetsTableData"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { Text } from "components/Typography/Text/Text"
import { WalletAssetsHydraPositionsActions } from "sections/wallet/assets/hydraPositions/actions/WalletAssetsHydraPositionsActions"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import BN from "bignumber.js"

export const useHydraPositionsTable = (
  data: HydraPositionsTableData[],
  actions: { onTransfer: (assetId: string) => void },
) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<HydraPositionsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    value: true,
    price: isDesktop,
    actions: true,
  }

  const columns = [
    accessor("symbol", {
      id: "name",
      header: t("wallet.assets.hydraPositions.header.name"),
      cell: ({ row }) => <WalletAssetsTableName {...row.original} />,
    }),
    accessor("value", {
      id: "value",
      header: t("wallet.assets.hydraPositions.header.value"),
      sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
      cell: ({ row }) => (
        <WalletAssetsHydraPositionsData
          symbol={row.original.symbol}
          lrna={row.original.lrna}
          value={row.original.value}
          valueUSD={row.original.valueUSD}
        />
      ),
    }),
    accessor("price", {
      id: "price",
      header: t("wallet.assets.hydraPositions.header.price"),
      cell: ({ row }) => (
        <Text fw={500} fs={16} lh={16} color="green600">
          {t("value.usd", { amount: row.original.price })}
        </Text>
      ),
    }),
    display({
      id: "actions",
      cell: ({ row }) => (
        <WalletAssetsHydraPositionsActions
          toggleExpanded={() => row.toggleExpanded()}
          onTransferClick={() => actions.onTransfer(row.original.id)}
        />
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return table
}

export type HydraPositionsTableData = {
  id: string
  symbol: string
  name: string
  lrna: BN
  value: BN
  valueUSD: BN
  price: BN
  providedAmount: BN
  providedAmountUSD: BN
  sharesAmount: BN
}
