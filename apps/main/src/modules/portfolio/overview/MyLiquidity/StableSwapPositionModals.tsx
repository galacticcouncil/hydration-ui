import { FC } from "react"

import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"
import { LiquidityPositionAction } from "@/modules/portfolio/overview/MyLiquidity/LiquidityPositionMoreActions"
import { StableswapPosition } from "@/modules/portfolio/overview/MyLiquidity/MyLiquidityTable.data"
import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"

type Props = {
  readonly action: LiquidityPositionAction.Remove | LiquidityPositionAction.Add
  readonly position: StableswapPosition

  readonly onSubmit: () => void
}

export const StableSwapPositionModals: FC<Props> = ({
  action,
  position,
  onSubmit,
}) => {
  if (action === LiquidityPositionAction.Remove) {
    return (
      <RemoveLiquidity
        poolId={position.assetId}
        stableswapId={position.assetId}
        closable
        onSubmitted={onSubmit}
      />
    )
  }

  return (
    <AddLiquidityModalContent
      id={position.assetId}
      closable
      onSubmitted={onSubmit}
    />
  )
}
