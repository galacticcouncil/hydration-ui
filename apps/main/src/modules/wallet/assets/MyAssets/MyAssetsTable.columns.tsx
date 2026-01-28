import { LockOpen } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  DataTableExpandTrigger,
  Flex,
  Icon,
  Modal,
  TableRowAction,
  TableRowDetailsExpand,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { AnyChain } from "@galacticcouncil/xc-core"
import { Link } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetDetailStaking } from "@/modules/wallet/assets/MyAssets/AssetDetailStaking"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { naturally, numericallyStr, sortBy } from "@/utils/sort"

export enum MyAssetsTableColumn {
  Asset = "asset",
  Total = "total",
  Transferable = "transferable",
  Staking = "staking",
  Actions = "actions",
}

export type MyAsset = TAssetData & {
  readonly origin: AnyChain | null
  readonly total: string
  readonly totalDisplay: string
  readonly transferable: string
  readonly transferableDisplay: string
  readonly reserved: string
  readonly reservedDca: string | undefined
  readonly canStake: boolean
}

const columnHelper = createColumnHelper<MyAsset>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"

export const useMyAssetsColumns = (isEmpty: boolean) => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      id: MyAssetsTableColumn.Asset,
      header: t("common:asset"),
      sortingFn: sortBy({
        select: (row) => row.original.symbol,
        compare: naturally,
      }),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original} />
      },
    })

    const totalColumn = columnHelper.accessor("total", {
      id: MyAssetsTableColumn.Total,
      header: t("myAssets.header.total"),
      sortingFn: sortBy({
        select: (row) => row.original.totalDisplay,
        compare: numericallyStr,
      }),
      cell: function Cell({ row }) {
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.total,
        )

        return (
          <Amount
            value={t("common:number", {
              value: row.original.total,
            })}
            displayValue={displayPrice}
          />
        )
      },
    })

    const transferableColumn = columnHelper.accessor("transferable", {
      id: MyAssetsTableColumn.Transferable,
      header: t("myAssets.header.transferable"),
      sortingFn: sortBy({
        select: (row) => row.original.transferableDisplay,
        compare: numericallyStr,
      }),
      cell: function Cell({ row }) {
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.transferable,
        )

        return (
          <Amount
            value={t("common:number", {
              value: row.original.transferable,
            })}
            displayValue={displayPrice}
          />
        )
      },
    })

    const stakingColumn = columnHelper.display({
      id: MyAssetsTableColumn.Staking,
      cell: ({ row }) => {
        return <AssetDetailStaking asset={row.original} />
      },
    })

    const actionsColumn = columnHelper.display({
      id: MyAssetsTableColumn.Actions,
      header: t("common:actions"),
      meta: {
        sx: {
          textAlign: "right",
          ...(isEmpty && { pr: "0 !important" }),
        },
      },
      cell: function Cell({ row }) {
        const [modal, setModal] = useState<AssetDetailModal | null>(null)

        return (
          <Flex gap={8} justify="flex-end">
            {row.original.id === NATIVE_ASSET_ID && (
              <DataTableExpandTrigger>
                <TableRowAction variant="accent">
                  <Icon component={LockOpen} size={12} />
                  {t("myAssets.locks")}
                </TableRowAction>
              </DataTableExpandTrigger>
            )}
            <TableRowAction onClick={() => setModal("transfer")}>
              {t("common:send")}
            </TableRowAction>
            <TableRowAction disabled={!row.original.isTradable} asChild>
              <Link
                to="/trade/swap/market"
                search={{ assetIn: row.original.id }}
                disabled={!row.original.isTradable}
              >
                {t("common:trade")}
              </Link>
            </TableRowAction>
            <Modal open={modal !== null} onOpenChange={() => setModal(null)}>
              {modal === "transfer" && (
                <TransferPositionModal
                  assetId={row.original.id}
                  onClose={() => setModal(null)}
                />
              )}
            </Modal>
          </Flex>
        )
      },
    })

    const assetColumnMobile = columnHelper.accessor("symbol", {
      enableSorting: false,
      header: t("common:asset"),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original} withName={false} />
      },
    })

    const totalColumnMobile = columnHelper.accessor("total", {
      id: MyAssetsTableColumn.Total,
      header: t("myAssets.header.total"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      sortingFn: sortBy({
        select: (row) => row.original.totalDisplay,
        compare: numericallyStr,
      }),
      cell: function Cell({ row }) {
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.total,
        )

        return (
          <TableRowDetailsExpand>
            {row.original.id === NATIVE_ASSET_ID && (
              <TableRowAction variant="accent" allowPropagation>
                <Icon component={LockOpen} size={12} />
                {t("myAssets.locks")}
              </TableRowAction>
            )}
            <Amount
              variant="default"
              value={t("common:number", {
                value: row.original.total,
              })}
              displayValue={displayPrice}
            />
          </TableRowDetailsExpand>
        )
      },
    })

    return isMobile
      ? ([assetColumnMobile, totalColumnMobile] as Array<ColumnDef<MyAsset>>)
      : ([
          assetColumn,
          totalColumn,
          transferableColumn,
          stakingColumn,
          actionsColumn,
        ] as Array<ColumnDef<MyAsset>>)
  }, [isMobile, isEmpty, t])
}
