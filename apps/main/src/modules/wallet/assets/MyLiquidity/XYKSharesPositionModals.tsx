import { FC } from "react"

import { JoinFarmsWrapper } from "@/modules/liquidity/components/JoinFarms"
import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { XYKPosition } from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"

type Props = {
  readonly action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join
  readonly position: XYKPosition
  readonly onSubmit: () => void
}

export const XYKSharesPositionModals: FC<Props> = ({
  action,
  position,
  onSubmit,
}) => {
  if (action === LiquidityPositionAction.Remove) {
    return (
      <RemoveLiquidity
        poolId={position.amm_pool_id}
        shareTokenId={position.meta.id}
        closable
        onSubmitted={onSubmit}
      />
    )
  }

  return (
    <JoinFarmsWrapper
      poolId={position.amm_pool_id}
      closable
      onSubmitted={onSubmit}
    />
  )
}
