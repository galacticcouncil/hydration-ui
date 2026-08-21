import { FC } from "react"

import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { useNeckworkPastExecutionsData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useNeckworkPastExecutionsData"

type Props = {
  readonly scheduleId: number
  readonly className?: string
}

export const PastExecutionsNeckwork: FC<Props> = ({
  scheduleId,
  className,
}) => {
  const data = useNeckworkPastExecutionsData(scheduleId)

  return <PastExecutions {...data} className={className} />
}
