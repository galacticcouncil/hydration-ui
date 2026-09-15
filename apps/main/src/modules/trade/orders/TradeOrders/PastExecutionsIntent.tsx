import { FC } from "react"

import { PastExecutions as PastExecutionsList } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { useIntentPastExecutionsData } from "@/modules/trade/orders/TradeOrders/lib/useIntentPastExecutionsData"

type Props = {
  readonly intentId: bigint
  readonly className?: string
}

export const PastExecutionsIntent: FC<Props> = ({ intentId, className }) => {
  const data = useIntentPastExecutionsData(intentId)

  return <PastExecutionsList {...data} className={className} />
}
