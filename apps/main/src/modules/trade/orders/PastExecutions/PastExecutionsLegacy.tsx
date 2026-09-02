import { FC } from "react"

import { useOrderTradesData } from "@/modules/trade/orders/lib/useOrderTradesData"
import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly scheduleId: number
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  readonly className?: string
}

export const PastExecutionsLegacy: FC<Props> = ({
  scheduleId,
  assetIn,
  assetOut,
  className,
}) => {
  const { executions, isLoading } = useOrderTradesData(
    scheduleId,
    assetIn,
    assetOut,
  )

  return (
    <PastExecutions
      assetIn={assetIn}
      assetOut={assetOut}
      executions={executions}
      isLoading={isLoading}
      className={className}
    />
  )
}
