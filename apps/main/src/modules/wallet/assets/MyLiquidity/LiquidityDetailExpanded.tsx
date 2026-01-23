import { FC } from "react"

import { TAssetData } from "@/api/assets"
import { useOmnipoolActiveFarm } from "@/api/farms"
import { useMinOmnipoolFarmJoin } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { SLiquidityDetailExpandedContainer } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded.styled"
import { LiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { AccountOmnipoolPosition } from "@/states/account"

import { XYKPositionDeposit } from "./MyIsolatedPoolsLiquidity.data"
import {
  isStableswapPosition,
  OmnipoolLiquidityByAsset,
  StableswapPosition,
} from "./MyLiquidityTable.data"
import { StableswapLiquidityPosition } from "./StableswapPosition"

type Props = {
  readonly asset: TAssetData
  readonly positions: OmnipoolLiquidityByAsset["positions"]
  readonly onLiquidityAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: AccountOmnipoolPosition | XYKPositionDeposit,
    assetId: string,
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
  onStableSwapAction,
}) => {
  const { data: activeFarms = [] } = useOmnipoolActiveFarm(asset.id)
  const farms = activeFarms.filter((farm) => farm.apr !== "0")
  const minJoinAmount = useMinOmnipoolFarmJoin(farms, asset)

  return (
    <SLiquidityDetailExpandedContainer>
      {positions.map((position, index) => {
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
              farms={farms}
              minJoinAmount={minJoinAmount}
              onAction={(action) =>
                onLiquidityAction(action, position, asset.id)
              }
            />
          )
        }
      })}
    </SLiquidityDetailExpandedContainer>
  )
}
