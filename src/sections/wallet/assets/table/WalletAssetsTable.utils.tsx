import BN from "bignumber.js"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Trans, useTranslation } from "react-i18next"
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
  actions: { onTransfer: (assetId: string) => void },
) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<AssetsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])
  const setFeeAsPayment = useSetAsFeePayment()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    transferable: true,
    total: isDesktop,
    actions: true,
  }

  const columns = [
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
          onSetFeeAsPaymentClick={() =>
            setFeeAsPayment(row.original.id, {
              onLoading: (
                <Trans
                  t={t}
                  i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
                  tOptions={{
                    asset: row.original.symbol,
                  }}
                >
                  <span />
                  <span className="highlight" />
                </Trans>
              ),
              onSuccess: (
                <Trans
                  t={t}
                  i18nKey="wallet.assets.table.actions.payment.toast.onSuccess"
                  tOptions={{
                    asset: row.original.symbol,
                  }}
                >
                  <span />
                  <span className="highlight" />
                </Trans>
              ),
              onError: (
                <Trans
                  t={t}
                  i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
                  tOptions={{
                    asset: row.original.symbol,
                  }}
                >
                  <span />
                  <span className="highlight" />
                </Trans>
              ),
            })
          }
          couldBeSetAsPaymentFee={row.original.couldBeSetAsPaymentFee}
          onBuyClick={
            row.original.inTradeRouter
              ? () =>
                  navigate({
                    to: "/trade",
                    search: { assetOut: row.original.id },
                  })
              : undefined
          }
          onSellClick={
            row.original.inTradeRouter
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
  isPaymentFee: boolean
}
