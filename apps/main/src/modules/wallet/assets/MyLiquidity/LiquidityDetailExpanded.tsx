import { FC } from "react"

import { SLiquidityDetailExpandedContainer } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded.styled"
import { LiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { TAsset } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"

import {
  isXYKPositionDeposit,
  XYKPosition,
  XYKPositionDeposit,
} from "./MyIsolatedPoolsLiquidity.data"
import {
  isStableswapPosition,
  isXYKPosition,
  MyLiquidityPosition,
  StableswapPosition,
} from "./MyLiquidityTable.data"
import { StableswapLiquidityPosition } from "./StableswapPosition"
import { XYKDeposit } from "./XYKDeposit"
import { XYKSharesPositions } from "./XYKSharesPositions"

type Props = {
  readonly asset: TAsset
  readonly positions: ReadonlyArray<MyLiquidityPosition>
  readonly onLiquidityAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: AccountOmnipoolPosition | XYKPositionDeposit,
    assetId: string,
  ) => void
  readonly onXykSharesAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: XYKPosition,
  ) => void
  readonly onStableSwapAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Add,
    position: StableswapPosition,
  ) => void
}

export const LiquidityDetailExpanded: FC<Props> = ({
  asset,
  positions,
  onLiquidityAction,
  onXykSharesAction,
  onStableSwapAction,
}) => (
  <SLiquidityDetailExpandedContainer>
    {positions.map((position, index) => {
      if (isXYKPosition(position)) {
        if (isXYKPositionDeposit(position)) {
          return (
            <XYKDeposit
              key={index}
              number={index + 1}
              position={position}
              onAction={(action) =>
                onLiquidityAction(action, position, position.meta.id)
              }
            />
          )
        } else {
          return (
            <XYKSharesPositions
              key={index}
              position={position}
              onAction={(action) => onXykSharesAction(action, position)}
            />
          )
        }
      } else {
        if (isStableswapPosition(position)) {
          return (
            <StableswapLiquidityPosition
              key={index}
              position={position}
              onAction={(action) => onStableSwapAction(action, position)}
            />
          )
        } else {
          return (
            <LiquidityPosition
              key={index}
              asset={asset}
              number={index + 1}
              position={position}
              onAction={(action) =>
                onLiquidityAction(action, position, asset.id)
              }
            />
          )
        }
      }
    })}
  </SLiquidityDetailExpandedContainer>
)
