import { FC } from "react"

import { PastExecutions as PastExecutionsList } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { PastExecutionsModalSection } from "@/modules/trade/orders/PastExecutions/PastExecutionsModalSection"
import { useIntentPastExecutionsData } from "@/modules/trade/orders/TradeOrders/lib/useIntentPastExecutionsData"

type Props = {
  readonly intentId: bigint
  readonly periodMs?: number | null
  readonly className?: string
}

export const PastExecutionsIntent: FC<Props> = ({
  intentId,
  periodMs,
  className,
}) => {
  const data = useIntentPastExecutionsData(intentId)

  return (
    <PastExecutionsModalSection
      executions={data.executions}
      isLoading={data.isLoading}
    >
      <PastExecutionsList {...data} periodMs={periodMs} className={className} />
    </PastExecutionsModalSection>
  )
}
