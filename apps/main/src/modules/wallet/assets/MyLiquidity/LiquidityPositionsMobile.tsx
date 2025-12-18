import { Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SLiquidityPositionsMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileModal.styled"
import { SLiquidityPositionMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobile.styled"
import {
  LiquidityPositionMobileHeader,
  XYKLiquidityPositionMobileHeader,
} from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobileHeader"
import { LiquidityPositionMobileValues } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobileValues"
import { TAsset } from "@/providers/assetsProvider"

import { isXYKPosition, MyLiquidityPosition } from "./MyLiquidityTable.data"

type Props = {
  readonly asset: TAsset
  readonly positions: ReadonlyArray<MyLiquidityPosition>
}

export const LiquidityPositionsMobile: FC<Props> = ({ asset, positions }) => {
  return (
    <SLiquidityPositionsMobile>
      {positions.map((position, index) => (
        <SLiquidityPositionMobile key={index}>
          {isXYKPosition(position) ? (
            <XYKLiquidityPositionMobileHeader
              asset={position.meta}
              position={position}
            />
          ) : (
            <LiquidityPositionMobileHeader asset={asset} position={position} />
          )}
          <Separator />
          <LiquidityPositionMobileValues position={position} />
        </SLiquidityPositionMobile>
      ))}
    </SLiquidityPositionsMobile>
  )
}
