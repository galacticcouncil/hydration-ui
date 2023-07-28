import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { WalletAssetsHydraPositionsActions } from "sections/wallet/assets/hydraPositions/actions/WalletAssetsHydraPositionsActions"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { WalletAssetsTableName } from "sections/wallet/assets/table/data/WalletAssetsTableData"
import { theme } from "theme"

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
    valueUSD: isDesktop,
    actions: true,
  }

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "name",
        header: t("wallet.assets.hydraPositions.header.name"),
        cell: ({ row }) => <WalletAssetsTableName {...row.original} />,
      }),
      accessor("value", {
        id: "value",
        header: t("wallet.assets.hydraPositions.header.position"),
        sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
        cell: ({ row }) => (
          <WalletAssetsHydraPositionsData
            symbol={row.original.symbol}
            lrna={row.original.lrna}
            value={row.original.value}
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
          <Text fw={500} fs={16} lh={16} color="green600" tAlign="left">
            <DisplayValue value={row.original.valueDisplay} />
          </Text>
        ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <WalletAssetsHydraPositionsActions
            toggleExpanded={row.toggleSelected}
            onTransferClick={() => actions.onTransfer(row.original.assetId)}
            isExpanded={row.getIsSelected()}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions],
  )

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
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
  shares: BN
}
