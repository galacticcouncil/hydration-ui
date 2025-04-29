import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Flex,
  Icon,
  Modal,
  TableRowAction,
  TableRowActionMobile,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain } from "@galacticcouncil/xcm-core"
import { useNavigate } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { TRugCheckData } from "@/api/external"
import { AssetLabelFull, useDisplayAssetPrice } from "@/components"
import { AssetDetailMobileModal } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal"
import { AssetDetailNativeMobileModal } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal"
import { AssetDetailStaking } from "@/modules/wallet/assets/MyAssets/AssetDetailStaking"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"
import { useAssets } from "@/providers/assetsProvider"
import { TAssetStored } from "@/states/assetRegistry"
import { naturally, numericallyStr, sortBy } from "@/utils/sort"

export enum MyAssetsTableColumn {
  Asset = "asset",
  Total = "total",
  Transferable = "transferable",
  Staking = "staking",
  Actions = "actions",
}

export type MyAsset = TAssetStored & {
  readonly origin: AnyChain | null
  readonly total: string
  readonly totalDisplay: string
  readonly transferable: string
  readonly transferableDisplay: string
  readonly reserved: string
  readonly reservedDca: string
  readonly canStake: boolean
  readonly rugCheckData: TRugCheckData | undefined
}

const columnHelper = createColumnHelper<MyAsset>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"

export const useMyAssetsColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()
  const { native } = useAssets()

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
        },
      },
      cell: function Cell({ row }) {
        const [modal, setModal] = useState<AssetDetailModal | null>(null)
        const navigate = useNavigate()

        return (
          <Flex gap={8} justify="flex-end">
            <TableRowAction onClick={() => setModal("transfer")}>
              {t("common:send")}
            </TableRowAction>
            <TableRowAction
              onClick={() =>
                navigate({
                  to: "/trade/swap/market",
                  search: { assetOut: row.original.id },
                })
              }
            >
              {t("common:trade")}
            </TableRowAction>
            {/* TODO more actions */}
            {false && (
              <TableRowAction>
                <Icon
                  component={Ellipsis}
                  color={getToken("icons.onContainer")}
                  size={12}
                />
              </TableRowAction>
            )}
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
      cell: function Cell({ row }) {
        type Modal = "detail" | `action:${AssetDetailModal}`

        const [modal, setModal] = useState<Modal | null>(null)
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.total,
        )

        return (
          <>
            <TableRowActionMobile onClick={() => setModal("detail")}>
              <Amount
                variant="small"
                value={t("common:number", {
                  value: row.original.total,
                })}
                displayValue={displayPrice}
              />
            </TableRowActionMobile>
            <Modal
              open={modal === "detail"}
              onOpenChange={() => setModal(null)}
            >
              {row.original.id === native.id ? (
                <AssetDetailNativeMobileModal
                  asset={row.original}
                  onModalOpen={(action) => setModal(`action:${action}`)}
                />
              ) : (
                <AssetDetailMobileModal
                  asset={row.original}
                  onModalOpen={(action) => setModal(`action:${action}`)}
                />
              )}
            </Modal>
            <Modal
              open={modal?.startsWith("action")}
              onOpenChange={() => setModal("detail")}
            >
              {modal === "action:transfer" && (
                <TransferPositionModal
                  assetId={row.original.id}
                  onClose={() => setModal("detail")}
                />
              )}
            </Modal>
          </>
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
  }, [isMobile, t, native])
}
