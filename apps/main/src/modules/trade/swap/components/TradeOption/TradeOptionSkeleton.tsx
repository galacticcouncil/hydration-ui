import { Skeleton } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { STradeOptionSkeleton } from "@/modules/trade/swap/components/TradeOption/TradeOption.styled"

export const TradeOptionSkeleton: FC = () => {
  return (
    <STradeOptionSkeleton>
      <Skeleton height={"4rem"} />
    </STradeOptionSkeleton>
  )
}
