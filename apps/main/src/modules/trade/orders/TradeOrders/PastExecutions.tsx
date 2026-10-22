import { FC } from "react"

import { PastExecutions as PastExecutionsList } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { PastExecutionsModalSection } from "@/modules/trade/orders/PastExecutions/PastExecutionsModalSection"
import { usePastExecutionsData } from "@/modules/trade/orders/TradeOrders/lib/usePastExecutionsData"

type Props = {
  readonly scheduleId: number
  readonly periodMs?: number | null
  readonly className?: string
}

export const PastExecutions: FC<Props> = ({
  scheduleId,
  periodMs,
  className,
}) => {
  const data = usePastExecutionsData(scheduleId)

  return (
    <PastExecutionsModalSection
      executions={data.executions}
      isLoading={data.isLoading}
    >
      <PastExecutionsList {...data} periodMs={periodMs} className={className} />
    </PastExecutionsModalSection>
  )
}
