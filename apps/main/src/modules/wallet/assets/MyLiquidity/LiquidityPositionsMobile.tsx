import { Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SLiquidityPositionsMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileModal.styled"
import { SLiquidityPositionMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobile.styled"
import { LiquidityPositionMobileHeader } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobileHeader"
import { LiquidityPositionMobileValues } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobileValues"
import { TAsset } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"

import { XYKPosition } from "./MyLiquidityTable.data"

type Props = {
  readonly asset: TAsset
  readonly positions: ReadonlyArray<AccountOmnipoolPosition | XYKPosition>
}

export const LiquidityPositionsMobile: FC<Props> = ({ asset, positions }) => {
  return (
    <SLiquidityPositionsMobile>
      {positions.map((position, index) => (
        <SLiquidityPositionMobile key={index}>
          <LiquidityPositionMobileHeader asset={asset} position={position} />
          <Separator />
          <LiquidityPositionMobileValues position={position} />
        </SLiquidityPositionMobile>
      ))}
    </SLiquidityPositionsMobile>
  )
}
