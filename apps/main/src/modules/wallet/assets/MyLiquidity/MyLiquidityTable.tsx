import {
  DataTable,
  Modal,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { RemoveVaultLiquidity } from "@/modules/liquidity/components/RemoveLiquidity/RemoveVaultLiquidity"
import { LiquidityDetailExpanded } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded"
import { LiquidityDetailMobileModal } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileModal"
import { LiquidityPositionModals } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionModals"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import {
  isIsolatedPoolLiquidity,
  XYKPosition,
  XYKPositionDeposit,
} from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import { MyLiquidityEmptyState } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityEmptyState"
import { useMyLiquidityColumns } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.columns"
import {
  LiquidityPositionByAsset,
  StableswapPosition,
} from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import {
  isVaultLiquidity,
  VaultLiquidityByPool,
} from "@/modules/wallet/assets/MyLiquidity/MyVaultLiquidity.data"
import { StableSwapPositionModals } from "@/modules/wallet/assets/MyLiquidity/StableSwapPositionModals"
import { VaultDetailMobileModal } from "@/modules/wallet/assets/MyLiquidity/VaultDetailMobileModal"
import { VaultLiquidityDetailExpanded } from "@/modules/wallet/assets/MyLiquidity/VaultLiquidityDetailExpanded"
import { XYKLiquidityDetailExpanded } from "@/modules/wallet/assets/MyLiquidity/XYKLiquidityDetailExpanded"
import { XYKSharesPositionModals } from "@/modules/wallet/assets/MyLiquidity/XYKSharesPositionModals"
import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"
import { AccountOmnipoolPosition } from "@/states/account"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
  readonly data: Array<LiquidityPositionByAsset>
  readonly isLoading: boolean
}

type ModalType = {
  readonly detail: LiquidityPositionByAsset
} & (
  | {
      readonly type: "mobile-modal-default"
    }
  | {
      readonly type: "add-liquidity"
      readonly assetId: string
    }
  | {
      readonly type: "liquidity-position"
      readonly position: AccountOmnipoolPosition | XYKPositionDeposit
      readonly assetId: string
      readonly action:
        | LiquidityPositionAction.Remove
        | LiquidityPositionAction.Join
    }
  | {
      readonly type: "xyk-shares-position"
      readonly position: XYKPosition
      readonly action:
        | LiquidityPositionAction.Remove
        | LiquidityPositionAction.Join
    }
  | {
      readonly type: "vault-add" | "vault-remove"
      readonly vault: VaultLiquidityByPool["vault"]
    }
  | {
      readonly type: "stableswap-position"
      readonly position: StableswapPosition
      readonly action:
        | LiquidityPositionAction.Remove
        | LiquidityPositionAction.Add
    }
)

export const MyLiquidityTable: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
  data,
  isLoading,
}) => {
  const { isMobile } = useBreakpoints()
  const columns = useMyLiquidityColumns()

  const [isDetailOpen, setIsDetailOpen] = useState<ModalType | null>(null)

  const mobileDetail =
    isDetailOpen?.type === "mobile-modal-default" ? isDetailOpen.detail : null
  const mobileVaultDetail =
    mobileDetail && isVaultLiquidity(mobileDetail) ? mobileDetail : null
  const mobileAssetDetail =
    mobileDetail && !isVaultLiquidity(mobileDetail) ? mobileDetail : null

  return (
    <TableContainer>
      <DataTable
        data={data}
        columns={columns}
        size="small"
        paginated
        {...paginationProps}
        {...sortingProps}
        isLoading={isLoading}
        globalFilter={searchPhrase}
        globalFilterFn={(row) =>
          row.original.meta.symbol
            .toLowerCase()
            .includes(searchPhrase.toLowerCase()) ||
          row.original.meta.name
            .toLowerCase()
            .includes(searchPhrase.toLowerCase())
        }
        expandable={isMobile ? false : "single"}
        getIsExpandable={({ positions }) => positions.length >= 1}
        renderSubComponent={(detail) =>
          isVaultLiquidity(detail) ? (
            <VaultLiquidityDetailExpanded
              detail={detail}
              onRemoveLiquidity={() =>
                setIsDetailOpen({
                  type: "vault-remove",
                  detail,
                  vault: detail.vault,
                })
              }
            />
          ) : isIsolatedPoolLiquidity(detail) ? (
            <XYKLiquidityDetailExpanded
              asset={detail.meta}
              positions={detail.positions}
              onLiquidityAction={(action, position, assetId) =>
                setIsDetailOpen({
                  type: "liquidity-position",
                  detail,
                  position,
                  assetId,
                  action,
                })
              }
              onXykSharesAction={(action, position) =>
                setIsDetailOpen({
                  type: "xyk-shares-position",
                  detail,
                  position,
                  action,
                })
              }
            />
          ) : (
            <LiquidityDetailExpanded
              asset={detail.meta}
              positions={detail.positions}
              onLiquidityAction={(action, position, assetId) =>
                setIsDetailOpen({
                  type: "liquidity-position",
                  detail,
                  position,
                  assetId,
                  action,
                })
              }
              onStableSwapAction={(action, position) =>
                setIsDetailOpen({
                  type: "stableswap-position",
                  detail,
                  position,
                  action,
                })
              }
            />
          )
        }
        emptyState={<MyLiquidityEmptyState />}
        onRowClick={(detail) =>
          setIsDetailOpen({ type: "mobile-modal-default", detail })
        }
      />
      <Modal
        variant="popup"
        open={!!isDetailOpen}
        onOpenChange={() =>
          setIsDetailOpen(
            !isDetailOpen ||
              isDetailOpen.type === "mobile-modal-default" ||
              !isMobile
              ? null
              : { type: "mobile-modal-default", detail: isDetailOpen.detail },
          )
        }
      >
        {mobileVaultDetail && (
          <VaultDetailMobileModal
            detail={mobileVaultDetail}
            onAddLiquidity={() =>
              setIsDetailOpen({
                type: "vault-add",
                detail: mobileVaultDetail,
                vault: mobileVaultDetail.vault,
              })
            }
            onRemoveLiquidity={() =>
              setIsDetailOpen({
                type: "vault-remove",
                detail: mobileVaultDetail,
                vault: mobileVaultDetail.vault,
              })
            }
          />
        )}
        {mobileAssetDetail && (
          <LiquidityDetailMobileModal
            detail={mobileAssetDetail}
            onAddLiquidity={(assetId) =>
              setIsDetailOpen({
                type: "add-liquidity",
                detail: mobileAssetDetail,
                assetId,
              })
            }
            onLiquidityAction={(action, position, assetId) =>
              setIsDetailOpen({
                type: "liquidity-position",
                detail: mobileAssetDetail,
                position,
                assetId,
                action,
              })
            }
            onXykSharesAction={(action, position) =>
              setIsDetailOpen({
                type: "xyk-shares-position",
                detail: mobileAssetDetail,
                position,
                action,
              })
            }
            onStableSwapAction={(action, position) =>
              setIsDetailOpen({
                type: "stableswap-position",
                detail: mobileAssetDetail,
                position,
                action,
              })
            }
          />
        )}
        {(isDetailOpen?.type === "vault-add" ||
          isDetailOpen?.type === "vault-remove") &&
          (isDetailOpen.type === "vault-add" ? (
            <AddVaultLiquidity
              vault={isDetailOpen.vault}
              closable
              onSubmitted={() =>
                setIsDetailOpen(
                  isMobile
                    ? {
                        type: "mobile-modal-default",
                        detail: isDetailOpen.detail,
                      }
                    : null,
                )
              }
            />
          ) : (
            <RemoveVaultLiquidity
              vault={isDetailOpen.vault}
              closable
              onSubmitted={() =>
                setIsDetailOpen(
                  isMobile
                    ? {
                        type: "mobile-modal-default",
                        detail: isDetailOpen.detail,
                      }
                    : null,
                )
              }
            />
          ))}
        {isDetailOpen?.type === "add-liquidity" && (
          <AddLiquidityModalContent
            id={isDetailOpen.assetId}
            closable
            onSubmitted={() =>
              setIsDetailOpen(
                isMobile
                  ? {
                      type: "mobile-modal-default",
                      detail: isDetailOpen.detail,
                    }
                  : null,
              )
            }
          />
        )}
        {isDetailOpen?.type === "liquidity-position" && (
          <LiquidityPositionModals
            action={isDetailOpen.action}
            position={isDetailOpen.position}
            assetId={isDetailOpen.assetId}
            onSubmit={() =>
              setIsDetailOpen(
                isMobile
                  ? {
                      type: "mobile-modal-default",
                      detail: isDetailOpen.detail,
                    }
                  : null,
              )
            }
          />
        )}
        {isDetailOpen?.type === "xyk-shares-position" && (
          <XYKSharesPositionModals
            action={isDetailOpen.action}
            position={isDetailOpen.position}
            onSubmit={() =>
              setIsDetailOpen(
                isMobile
                  ? {
                      type: "mobile-modal-default",
                      detail: isDetailOpen.detail,
                    }
                  : null,
              )
            }
          />
        )}
        {isDetailOpen?.type === "stableswap-position" && (
          <StableSwapPositionModals
            action={isDetailOpen.action}
            position={isDetailOpen.position}
            onSubmit={() =>
              setIsDetailOpen(
                isMobile
                  ? {
                      type: "mobile-modal-default",
                      detail: isDetailOpen.detail,
                    }
                  : null,
              )
            }
          />
        )}
      </Modal>
    </TableContainer>
  )
}
