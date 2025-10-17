import { FC } from "react"

import { useTerminateDcaSchedule } from "@/modules/trade/orders/lib/useTerminateDcaSchedule"
import { CancelTradeOrderModalContent } from "@/modules/trade/otc/cancel-order/CancelTradeOrderModalContent"

type Props = {
  readonly scheduleId: number
  readonly sold: string | null
  readonly total: string | null
  readonly symbol: string
  readonly onClose: () => void
}

export const TerminateDcaScheduleModalContent: FC<Props> = ({
  scheduleId,
  sold,
  total,
  symbol,

  onClose,
}) => {
  const terminateDcaSchedule = useTerminateDcaSchedule()

  return (
    <CancelTradeOrderModalContent
      sold={sold}
      total={total}
      symbol={symbol}
      onBack={onClose}
      onSubmit={() => {
        terminateDcaSchedule.mutate(scheduleId)
        onClose()
      }}
    />
  )
}
