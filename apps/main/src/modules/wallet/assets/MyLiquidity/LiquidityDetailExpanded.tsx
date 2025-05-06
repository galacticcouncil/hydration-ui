import { FC } from "react"

import { SLiquidityDetailExpandedContainer } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded.styled"
import { LiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition"
import { MyLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly asset: TAsset
  readonly positions: ReadonlyArray<MyLiquidityPosition>
}

export const LiquidityDetailExpanded: FC<Props> = ({ asset, positions }) => {
  return (
    <SLiquidityDetailExpandedContainer>
      {positions.map((position, index) => (
        <LiquidityPosition
          key={index}
          asset={asset}
          number={index + 1}
          position={position}
        />
      ))}
    </SLiquidityDetailExpandedContainer>
  )
}
