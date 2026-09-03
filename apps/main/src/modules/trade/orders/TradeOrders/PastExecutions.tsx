import { FC } from "react"

import { PastExecutions as PastExecutionsList } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { usePastExecutionsData } from "@/modules/trade/orders/TradeOrders/lib/usePastExecutionsData"

type Props = {
  readonly scheduleId: number
  readonly className?: string
}

export const PastExecutions: FC<Props> = ({ scheduleId, className }) => {
  const data = usePastExecutionsData(scheduleId)

  return <PastExecutionsList {...data} className={className} />
}
