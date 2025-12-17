import { FC } from "react"

import { JoinFarmsWrapper } from "@/modules/liquidity/components/JoinFarms"
import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { XYKPositionDeposit } from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import { isXYKPosition } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { AccountOmnipoolPosition } from "@/states/account"

type Props = {
  readonly action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join
  readonly position: AccountOmnipoolPosition | XYKPositionDeposit
  readonly assetId: string
  readonly onSubmit: () => void
}

export const LiquidityPositionModals: FC<Props> = ({
  action,
  position,
  assetId,
  onSubmit,
}) => {
  const isXyk = isXYKPosition(position)

  if (action === LiquidityPositionAction.Remove) {
    return (
      <RemoveLiquidity
        positionId={isXyk ? position.id : position.positionId}
        poolId={isXyk ? position.amm_pool_id : assetId}
        onSubmitted={onSubmit}
        closable
      />
    )
  }

  return (
    <JoinFarmsWrapper
      positionId={isXyk ? position.id : position.positionId}
      poolId={isXyk ? position.amm_pool_id : assetId}
      closable
      onSubmitted={onSubmit}
    />
  )
}
