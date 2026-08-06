import { LockOpen, StylizedAdd } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  DataTableExpandTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  Modal,
  Skeleton,
  TableRowAction,
  TableRowDetailsExpand,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { AnyChain } from "@galacticcouncil/xc-core"
import { Link } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { LINKS } from "@/config/navigation"
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
  readonly xcAssetKey?: string
  readonly total: string
  readonly totalDisplay: string | undefined
  readonly transferable: string
  readonly transferableDisplay: string | undefined
  readonly canStake: boolean
}

const DepositToHydrationAction: FC<{ readonly asset: MyAsset }> = ({
  asset,
}) => {
  const { t } = useTranslation("wallet")

  if (!asset.origin || !asset.xcAssetKey) return null

  return (
    <TableRowAction asChild>
      <Link
        to={LINKS.crossChain}
        search={{
          srcChain: asset.origin.key,
          srcAsset: asset.xcAssetKey,
        }}
      >
        {t("myAssets.actions.depositToHydration")}
      </Link>
    </TableRowAction>
  )
}

const columnHelper = createColumnHelper<MyAsset>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"

const AssetSkeletonCell = () => (
  <Flex align="center" gap="base">
    <Skeleton circle width="2rem" height="2rem" />
    <Flex direction="column" gap="xs">
      <Skeleton width="4rem" height="1rem" />
      <Skeleton width="7rem" height="0.875rem" />
    </Flex>
  </Flex>
)

const AmountSkeletonCell = () => (
  <Flex direction="column" gap="xs">
    <Skeleton width="6rem" height="1rem" />
    <Skeleton width="4rem" height="0.875rem" />
  </Flex>
)

const ActionsSkeletonCell = () => (
  <Flex justify="flex-end" gap="base">
    <Skeleton width="8.875rem" height="1.875rem" borderRadius="1rem" />
    <Skeleton width="4.625rem" height="1.875rem" borderRadius="1rem" />
    <Skeleton width="4.625rem" height="1.875rem" borderRadius="1rem" />
  </Flex>
)

const DepositActionSkeletonCell = () => (
  <Flex justify="flex-end">
    <Skeleton width="10.5rem" height="1.875rem" borderRadius="1rem" />
  </Flex>
)

export const useMyAssetsColumns = (isEmpty: boolean, isReadOnly = false) => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile, gte } = useBreakpoints()
  const isWideDesktop = gte("xl")

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      id: MyAssetsTableColumn.Asset,
      size: isWideDesktop ? 350 : 280,
      header: t("common:asset"),
      meta: {
        skeletonCell: AssetSkeletonCell,
      },
      sortingFn: sortBy({
        select: (row) => row.original.symbol,
        compare: naturally,
      }),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original} />
      },
    })

    const totalColumn = columnHelper.accessor("totalDisplay", {
      id: MyAssetsTableColumn.Total,
      header: t("myAssets.header.total"),
      size: 230,
      sortUndefined: "last",
      meta: {
        skeletonCell: AmountSkeletonCell,
      },
      sortingFn: sortBy({
        select: (row) => row.original.totalDisplay ?? "",
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

    const transferableColumn = columnHelper.accessor("transferableDisplay", {
      id: MyAssetsTableColumn.Transferable,
      header: t("myAssets.header.transferable"),
      sortUndefined: "last",
      meta: {
        skeletonCell: AmountSkeletonCell,
      },
      sortingFn: sortBy({
        select: (row) => row.original.transferableDisplay ?? "",
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

    const actionsColumn = columnHelper.display({
      id: MyAssetsTableColumn.Actions,
      header: t("common:actions"),
      meta: {
        sx: {
          textAlign: "right",
          ...(isEmpty && { pr: "0 !important" }),
        },
        skeletonCell: isReadOnly
          ? DepositActionSkeletonCell
          : ActionsSkeletonCell,
      },
      cell: function Cell({ row }) {
        const [modal, setModal] = useState<AssetDetailModal | null>(null)

        if (isReadOnly) {
          return (
            <Flex align="center" justify="flex-end">
              <DepositToHydrationAction asset={row.original} />
            </Flex>
          )
        }

        return (
          <Flex
            gap={isWideDesktop ? "base" : "s"}
            align="center"
            justify="flex-end"
          >
            {row.original.id === NATIVE_ASSET_ID && (
              <>
                {isWideDesktop ? (
                  <AssetDetailStaking asset={row.original} />
                ) : null}
                <DataTableExpandTrigger>
                  <TableRowAction variant="accent">
                    <Icon component={LockOpen} size="xs" />
                    {t("myAssets.locks")}
                  </TableRowAction>
                </DataTableExpandTrigger>
              </>
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
            {row.original.id === NATIVE_ASSET_ID && !isWideDesktop && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TableRowAction
                    aria-label={t("common:more")}
                    sx={{ width: 30, minWidth: 30, px: 0 }}
                  >
                    <Icon component={MoreHorizontal} size="xs" />
                  </TableRowAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <MenuItem asChild>
                      <Link to={LINKS.stakingGigaStake}>
                        <MenuItemIcon component={StylizedAdd} />
                        <MenuItemLabel>
                          {t("myAssets.actions.staking", {
                            symbol: row.original.symbol,
                          })}
                        </MenuItemLabel>
                      </Link>
                    </MenuItem>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Modal
              variant="popup"
              open={modal !== null}
              onOpenChange={() => setModal(null)}
            >
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
      meta: {
        skeletonCell: AssetSkeletonCell,
      },
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original} withName={false} />
      },
    })

    const totalColumnMobile = columnHelper.accessor("totalDisplay", {
      id: MyAssetsTableColumn.Total,
      header: t("myAssets.header.total"),
      sortUndefined: "last",
      meta: {
        sx: {
          textAlign: "right",
        },
        skeletonCell: AmountSkeletonCell,
      },
      sortingFn: sortBy({
        select: (row) => row.original.totalDisplay ?? "",
        compare: numericallyStr,
      }),
      cell: function Cell({ row }) {
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.total,
        )

        const amount = (
          <Amount
            variant="default"
            value={t("common:number", {
              value: row.original.total,
            })}
            displayValue={displayPrice}
          />
        )

        if (isReadOnly) {
          return (
            <Flex direction="column" align="flex-end" gap="xs" justify="center">
              {amount}
              <DepositToHydrationAction asset={row.original} />
            </Flex>
          )
        }

        return (
          <TableRowDetailsExpand>
            {row.original.id === NATIVE_ASSET_ID && (
              <TableRowAction variant="accent" allowPropagation>
                <Icon component={LockOpen} size="xs" />
                {t("myAssets.locks")}
              </TableRowAction>
            )}
            {amount}
          </TableRowDetailsExpand>
        )
      },
    })

    if (isMobile) {
      return [assetColumnMobile, totalColumnMobile] as Array<ColumnDef<MyAsset>>
    }

    if (isReadOnly) {
      return [assetColumn, totalColumn, actionsColumn] as Array<
        ColumnDef<MyAsset>
      >
    }

    return [
      assetColumn,
      totalColumn,
      transferableColumn,
      actionsColumn,
    ] as Array<ColumnDef<MyAsset>>
  }, [isWideDesktop, isMobile, isEmpty, isReadOnly, t])
}
