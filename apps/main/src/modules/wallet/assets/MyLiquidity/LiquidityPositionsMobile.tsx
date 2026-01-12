import { Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SLiquidityPositionsMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileModal.styled"
import { SLiquidityPositionMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobile.styled"
import {
  LiquidityPositionMobileHeader,
  XYKLiquidityPositionMobileHeader,
} from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobileHeader"
import { LiquidityPositionMobileValues } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobileValues"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import {
  isXYKPositionDeposit,
  XYKPosition,
  XYKPositionDeposit,
} from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import { TAsset } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"

import {
  isXYKPosition,
  MyLiquidityPosition,
  StableswapPosition,
} from "./MyLiquidityTable.data"

type Props = {
  readonly asset: TAsset
  readonly positions: ReadonlyArray<MyLiquidityPosition>
  readonly onLiquidityAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: AccountOmnipoolPosition | XYKPositionDeposit,
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

export const LiquidityPositionsMobile: FC<Props> = ({
  asset,
  positions,
  onLiquidityAction,
  onXykSharesAction,
  onStableSwapAction,
}) => {
  return (
    <SLiquidityPositionsMobile>
      {positions.map((position, index) => (
        <SLiquidityPositionMobile key={index}>
          {isXYKPosition(position) ? (
            <XYKLiquidityPositionMobileHeader
              asset={position.meta}
              position={position}
              onAction={(action) => {
                const isDepositPosition = isXYKPositionDeposit(position)

                if (isDepositPosition) {
                  onLiquidityAction(action, position)
                } else {
                  onXykSharesAction(action, position)
                }
              }}
            />
          ) : (
            <LiquidityPositionMobileHeader
              asset={asset}
              position={position}
              onLiquidityAction={onLiquidityAction}
              onStableSwapAction={onStableSwapAction}
            />
          )}
          <Separator />
          <LiquidityPositionMobileValues position={position} />
        </SLiquidityPositionMobile>
      ))}
    </SLiquidityPositionsMobile>
  )
}
