import { Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { LiquidityPosition } from "@/modules/wallet/MyLiquidity/LiquidityPosition"
import { WalletLiquidityPosition } from "@/modules/wallet/MyLiquidity/MyLiquidityTable.columns"

type Props = {
  readonly assetId: string
  readonly positions: ReadonlyArray<WalletLiquidityPosition>
}

export const LiquidityDetailExpanded: FC<Props> = ({ assetId, positions }) => {
  return (
    <Flex direction="column" gap={8}>
      {positions.map((position, index) => (
        <LiquidityPosition
          key={index}
          assetId={assetId}
          number={index + 1}
          position={position}
        />
      ))}
    </Flex>
  )
}
