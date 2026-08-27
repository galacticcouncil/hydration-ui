import { FC } from "react"

import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { useNeckworkPastExecutionsData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useNeckworkPastExecutionsData"
import { useNeckworkTradeQueriesEnabled } from "@/modules/trade/swap/tradeDataSource"

type Props = {
  readonly scheduleId: number
  readonly className?: string
}

export const PastExecutionsNeckwork: FC<Props> = ({
  scheduleId,
  className,
}) => {
  const neckworkEnabled = useNeckworkTradeQueriesEnabled()
  const data = useNeckworkPastExecutionsData(scheduleId)

  if (!neckworkEnabled) return null

  return <PastExecutions {...data} className={className} />
}
