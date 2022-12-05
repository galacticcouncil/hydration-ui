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
import { useState } from "react"
import { useSetAsFeePayment } from "api/payments"
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
  actions: {
    onTransfer: (assetId: string) => void
    onAddLiquidity: (assetId: string) => void
  },
) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<AssetsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])
  const setFeeAsPayment = useSetAsFeePayment()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    transferable: isDesktop,
    total: true,
    actions: true,
  }

  const columns = [
    accessor("symbol", {
      id: "name",
      header: t("wallet.assets.table.header.name"),
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
          balanceUSD={row.original.transferableUSD}
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
          balanceUSD={row.original.totalUSD}
        />
      ),
    }),
    display({
      id: "actions",
      cell: ({ row }) => (
        <WalletAssetsTableActions
          onSetFeeAsPaymentClick={() => setFeeAsPayment(row.original.id)}
          couldBeSetAsPaymentFee={row.original.couldBeSetAsPaymentFee}
          onBuyClick={
            row.original.inTradeRouter
              ? () =>
                  navigate({
                    to: "/trade",
                    search: { type: "assetOut", id: row.original.id },
                  })
              : undefined
          }
          onSellClick={
            row.original.inTradeRouter
              ? () =>
                  navigate({
                    to: "/trade",
                    search: { type: "assetIn", id: row.original.id },
                  })
              : undefined
          }
          couldAddLiquidity={!!row.original.poolLiquidityAddress}
          onAddLiquidityClick={() =>
            row.original.poolLiquidityAddress != null &&
            actions.onAddLiquidity(row.original.poolLiquidityAddress)
          }
          toggleExpanded={() => row.toggleExpanded()}
          onTransferClick={() => actions.onTransfer(row.original.id)}
          symbol={row.original.symbol}
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

export type AssetsTableData = {
  id: string
  symbol: string
  name: string
  transferable: BN
  transferableUSD: BN
  total: BN
  totalUSD: BN
  locked: BN
  lockedUSD: BN
  origin: string
  inTradeRouter: boolean
  assetType: PalletAssetRegistryAssetType["type"]
  couldBeSetAsPaymentFee: boolean
  poolLiquidityAddress: string | undefined
  isPaymentFee: boolean
}
