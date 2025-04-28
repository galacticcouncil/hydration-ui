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
import { useNavigate } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull, useDisplayAssetPrice } from "@/components"
import { AssetDetailMobileModal } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal"
import { AssetDetailStaking } from "@/modules/wallet/assets/MyAssets/AssetDetailStaking"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"
import { useAssets } from "@/providers/assetsProvider"
import { TAssetStored } from "@/states/assetRegistry"

export enum MyAssetsTableColumn {
  Asset = "asset",
  Total = "total",
  Transferable = "transferable",
  Staking = "staking",
  Actions = "actions",
}

export type MyAsset = TAssetStored & {
  readonly total: string
  readonly transferable: string
  readonly canStake: boolean
}

const columnHelper = createColumnHelper<MyAsset>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"

export const useMyAssetsColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()
  const { getAsset } = useAssets()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      id: MyAssetsTableColumn.Asset,
      enableSorting: false,
      header: t("common:asset"),
      cell: ({ row }) => {
        const asset = getAsset(row.original.id)

        return asset && <AssetLabelFull asset={asset} />
      },
    })

    const totalColumn = columnHelper.accessor("total", {
      id: MyAssetsTableColumn.Total,
      header: t("myAssets.header.total"),
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
          <Flex gap={8}>
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
            <TableRowAction>
              <Icon
                component={Ellipsis}
                color={getToken("icons.onContainer")}
                size={12}
              />
            </TableRowAction>
            <Modal open={modal !== null} onOpenChange={() => setModal(null)}>
              {modal === "transfer" && (
                <TransferPositionModal
                  position={{
                    assetId: row.original.id,
                    amount: row.original.transferable,
                  }}
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
        const asset = getAsset(row.original.id)

        return asset && <AssetLabelFull asset={asset} withName={false} />
      },
    })

    const totalColumnMobile = columnHelper.accessor("total", {
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
              <AssetDetailMobileModal
                asset={row.original}
                onModalOpen={(action) => setModal(`action:${action}`)}
              />
            </Modal>
            <Modal
              open={modal?.startsWith("action")}
              onOpenChange={() => setModal("detail")}
            >
              {modal === "action:transfer" && (
                <TransferPositionModal
                  position={{
                    assetId: row.original.id,
                    amount: row.original.transferable,
                  }}
                  onClose={() => setModal("detail")}
                />
              )}
            </Modal>
          </>
        )
      },
    })

    return isMobile
      ? [assetColumnMobile, totalColumnMobile]
      : [
          assetColumn,
          totalColumn,
          transferableColumn,
          stakingColumn,
          actionsColumn,
        ]
  }, [getAsset, isMobile, t])
}
