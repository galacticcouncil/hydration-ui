import { FC } from "react"

import { useIsolatedPoolFarms } from "@/api/farms"
import { useXYKFarmMinShares } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { SLiquidityDetailExpandedContainer } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded.styled"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { TShareToken } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"

import {
  isXYKPositionDeposit,
  XYKPosition,
  XYKPositionDeposit,
} from "./MyIsolatedPoolsLiquidity.data"
import { XYKDeposit } from "./XYKDeposit"
import { XYKSharesPositions } from "./XYKSharesPositions"

type Props = {
  readonly asset: TShareToken
  readonly positions: ReadonlyArray<XYKPosition>
  readonly onLiquidityAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: AccountOmnipoolPosition | XYKPositionDeposit,
    assetId: string,
  ) => void
  readonly onXykSharesAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: XYKPosition,
  ) => void
}

export const XYKLiquidityDetailExpanded: FC<Props> = ({
  asset,
  positions,
  onLiquidityAction,
  onXykSharesAction,
}) => {
  const { data: activeFarms = [] } = useIsolatedPoolFarms(asset.id)
  const farms = activeFarms.filter((farm) => farm.apr !== "0")
  const minJoinAmount = useXYKFarmMinShares(asset.poolAddress, farms)

  return (
    <SLiquidityDetailExpandedContainer>
      {positions.map((position, index) => {
        if (isXYKPositionDeposit(position)) {
          return (
            <XYKDeposit
              key={index}
              number={index + 1}
              position={position}
              minJoinAmount={minJoinAmount}
              farms={farms}
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
              minJoinAmount={minJoinAmount}
              farms={farms}
            />
          )
        }
      })}
    </SLiquidityDetailExpandedContainer>
  )
}
