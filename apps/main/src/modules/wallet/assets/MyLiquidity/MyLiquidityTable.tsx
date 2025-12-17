import {
  DataTable,
  Modal,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useState } from "react"

import { LiquidityDetailExpanded } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded"
import { LiquidityDetailMobileModal } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileModal"
import { LiquidityPositionModals } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionModals"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import {
  XYKPosition,
  XYKPositionDeposit,
} from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import { MyLiquidityEmptyState } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityEmptyState"
import {
  MyLiquidityTableColumnId,
  useMyLiquidityColumns,
} from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.columns"
import {
  LiquidityPositionByAsset,
  StableswapPosition,
} from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { StableSwapPositionModals } from "@/modules/wallet/assets/MyLiquidity/StableSwapPositionModals"
import { XYKSharesPositionModals } from "@/modules/wallet/assets/MyLiquidity/XYKSharesPositionModals"
import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"
import { AccountOmnipoolPosition } from "@/states/account"

type Props = {
  readonly searchPhrase: string
  readonly data: Array<LiquidityPositionByAsset>
  readonly isLoading: boolean
}

type ModalType = {
  readonly detail: LiquidityPositionByAsset
} & (
  | {
      readonly type: "default"
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
      readonly type: "stableswap-position"
      readonly position: StableswapPosition
      readonly action:
        | LiquidityPositionAction.Remove
        | LiquidityPositionAction.Add
    }
)

export const MyLiquidityTable: FC<Props> = ({
  searchPhrase,
  data,
  isLoading,
}) => {
  const { isMobile } = useBreakpoints()
  const columns = useMyLiquidityColumns()

  const [isDetailOpen, setIsDetailOpen] = useState<ModalType | null>(null)

  return (
    <TableContainer as={Paper}>
      <DataTable
        data={data}
        columns={columns}
        paginated
        pageSize={10}
        isLoading={isLoading}
        initialSorting={[
          { id: MyLiquidityTableColumnId.CurrentValue, desc: true },
        ]}
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
        renderSubComponent={(detail) => (
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
            onXykSharesAction={(action, position) =>
              setIsDetailOpen({
                type: "xyk-shares-position",
                detail,
                position,
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
        )}
        emptyState={<MyLiquidityEmptyState />}
        onRowClick={(detail) => setIsDetailOpen({ type: "default", detail })}
      />
      <Modal
        open={!!isDetailOpen}
        onOpenChange={() =>
          setIsDetailOpen(
            !isDetailOpen || isDetailOpen.type === "default"
              ? null
              : { type: "default", detail: isDetailOpen.detail },
          )
        }
      >
        {isDetailOpen?.type === "default" && (
          <LiquidityDetailMobileModal
            detail={isDetailOpen.detail}
            onAddLiquidity={(assetId) =>
              setIsDetailOpen({
                type: "add-liquidity",
                detail: isDetailOpen.detail,
                assetId,
              })
            }
            onLiquidityAction={(action, position, assetId) =>
              setIsDetailOpen({
                type: "liquidity-position",
                detail: isDetailOpen.detail,
                position,
                assetId,
                action,
              })
            }
            onXykSharesAction={(action, position) =>
              setIsDetailOpen({
                type: "xyk-shares-position",
                detail: isDetailOpen.detail,
                position,
                action,
              })
            }
            onStableSwapAction={(action, position) =>
              setIsDetailOpen({
                type: "stableswap-position",
                detail: isDetailOpen.detail,
                position,
                action,
              })
            }
          />
        )}
        {isDetailOpen?.type === "add-liquidity" && (
          <AddLiquidityModalContent
            id={isDetailOpen.assetId}
            closable
            onSubmitted={() =>
              setIsDetailOpen({ type: "default", detail: isDetailOpen.detail })
            }
          />
        )}
        {isDetailOpen?.type === "liquidity-position" && (
          <LiquidityPositionModals
            action={isDetailOpen.action}
            position={isDetailOpen.position}
            assetId={isDetailOpen.assetId}
            onSubmit={() =>
              setIsDetailOpen({
                type: "default",
                detail: isDetailOpen.detail,
              })
            }
          />
        )}
        {isDetailOpen?.type === "xyk-shares-position" && (
          <XYKSharesPositionModals
            action={isDetailOpen.action}
            position={isDetailOpen.position}
            onSubmit={() =>
              setIsDetailOpen({
                type: "default",
                detail: isDetailOpen.detail,
              })
            }
          />
        )}
        {isDetailOpen?.type === "stableswap-position" && (
          <StableSwapPositionModals
            action={isDetailOpen.action}
            position={isDetailOpen.position}
            onSubmit={() =>
              setIsDetailOpen({
                type: "default",
                detail: isDetailOpen.detail,
              })
            }
          />
        )}
      </Modal>
    </TableContainer>
  )
}
