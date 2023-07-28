import BN from "bignumber.js"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import {
  WalletAssetsTableBalance,
  WalletAssetsTableName,
} from "sections/wallet/assets/table/data/WalletAssetsTableData"
import { WalletAssetsTableActions } from "sections/wallet/assets/table/actions/WalletAssetsTableActions"
import { useMedia } from "react-use"
import { theme } from "theme"
import { PalletAssetRegistryAssetType } from "@polkadot/types/lookup"
import { useNavigate } from "@tanstack/react-location"

export const useAssetsTable = (
  data: AssetsTableData[],
  actions: { onTransfer: (assetId: string) => void },
) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<AssetsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    transferable: true,
    total: isDesktop,
    actions: true,
  }

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "name",
        header: isDesktop
          ? t("wallet.assets.table.header.name")
          : t("selectAssets.asset"),
        sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
        cell: ({ row }) => <WalletAssetsTableName {...row.original} />,
      }),
      accessor("transferable", {
        id: "transferable",
        header: t("wallet.assets.table.header.transferable"),
        sortingFn: (a, b) =>
          a.original.transferable.gt(b.original.transferable) ? 1 : -1,
        cell: ({ row }) => (
          <WalletAssetsTableBalance
            balance={row.original.transferable}
            balanceDisplay={row.original.transferableDisplay}
          />
        ),
      }),
      accessor("total", {
        id: "total",
        header: t("wallet.assets.table.header.total"),
        sortingFn: (a, b) => (a.original.total.gt(b.original.total) ? 1 : -1),
        cell: ({ row }) => (
          <WalletAssetsTableBalance
            balance={row.original.total}
            balanceDisplay={row.original.totalDisplay}
          />
        ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <WalletAssetsTableActions
            couldBeSetAsPaymentFee={row.original.couldBeSetAsPaymentFee}
            onBuyClick={
              row.original.tradability.inTradeRouter &&
              row.original.tradability.canBuy
                ? () =>
                    navigate({
                      to: "/trade",
                      search: { assetOut: row.original.id },
                    })
                : undefined
            }
            onSellClick={
              row.original.tradability.inTradeRouter &&
              row.original.tradability.canSell
                ? () =>
                    navigate({
                      to: "/trade",
                      search: { assetIn: row.original.id },
                    })
                : undefined
            }
            toggleExpanded={row.toggleSelected}
            isExpanded={row.getIsSelected()}
            onTransferClick={() => actions.onTransfer(row.original.id)}
            symbol={row.original.symbol}
            id={row.original.id}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions, isDesktop],
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

export type AssetsTableData = {
  id: string
  symbol: string
  name: string
  transferable: BN
  transferableDisplay: BN
  total: BN
  totalDisplay: BN
  lockedMax: BN
  lockedMaxDisplay: BN
  lockedVesting: BN
  lockedVestingDisplay: BN
  lockedDemocracy: BN
  lockedDemocracyDisplay: BN
  reserved: BN
  reservedDisplay: BN
  origin: string
  assetType: PalletAssetRegistryAssetType["type"]
  couldBeSetAsPaymentFee: boolean
  isPaymentFee: boolean
  tradability: {
    inTradeRouter: boolean
    canBuy: boolean
    canSell: boolean
    canAddLiquidity: boolean
    canRemoveLiquidity: boolean
  }
}
