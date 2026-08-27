import { FC } from "react"

import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { usePastExecutionsData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"

type Props = {
  readonly scheduleId: number
  readonly className?: string
}

export const PastExecutionsSquid: FC<Props> = ({ scheduleId, className }) => {
  const data = usePastExecutionsData(scheduleId)

  return <PastExecutions {...data} className={className} />
}
