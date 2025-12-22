import { FC } from "react"

import { SLiquidityDetailExpandedContainer } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded.styled"
import { LiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition"
import { TAsset } from "@/providers/assetsProvider"

import { isXYKPositionDeposit } from "./MyIsolatedPoolsLiquidity.data"
import {
  isStableswapPosition,
  isXYKPosition,
  MyLiquidityPosition,
} from "./MyLiquidityTable.data"
import { StableswapLiquidityPosition } from "./StableswapPosition"
import { XYKDeposit } from "./XYKDeposit"
import { XYKSharesPositions } from "./XYKSharesPositions"

type Props = {
  readonly asset: TAsset
  readonly positions: ReadonlyArray<MyLiquidityPosition>
}

export const LiquidityDetailExpanded: FC<Props> = ({ asset, positions }) => (
  <SLiquidityDetailExpandedContainer>
    {positions.map((position, index) => {
      if (isXYKPosition(position)) {
        if (isXYKPositionDeposit(position)) {
          return (
            <XYKDeposit key={index} number={index + 1} position={position} />
          )
        } else {
          return <XYKSharesPositions key={index} position={position} />
        }
      } else {
        if (isStableswapPosition(position)) {
          return <StableswapLiquidityPosition key={index} position={position} />
        } else {
          return (
            <LiquidityPosition
              key={index}
              asset={asset}
              number={index + 1}
              position={position}
            />
          )
        }
      }
    })}
  </SLiquidityDetailExpandedContainer>
)
