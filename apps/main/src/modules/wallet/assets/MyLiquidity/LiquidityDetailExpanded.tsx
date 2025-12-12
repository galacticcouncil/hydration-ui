import { FC } from "react"

import { SLiquidityDetailExpandedContainer } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded.styled"
import { LiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition"
import { TAsset } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"

import { isXYKPosition, XYKPosition } from "./MyLiquidityTable.data"
import { XYKDeposit } from "./XYKDeposit"

type Props = {
  readonly asset: TAsset
  readonly positions: ReadonlyArray<AccountOmnipoolPosition | XYKPosition>
}

export const LiquidityDetailExpanded: FC<Props> = ({ asset, positions }) => (
  <SLiquidityDetailExpandedContainer>
    {positions.map((position, index) =>
      isXYKPosition(position) ? (
        <XYKDeposit
          key={index}
          asset={asset}
          number={index + 1}
          position={position}
        />
      ) : (
        <LiquidityPosition
          key={index}
          asset={asset}
          number={index + 1}
          position={position}
        />
      ),
    )}
  </SLiquidityDetailExpandedContainer>
)
