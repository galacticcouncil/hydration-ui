import { FC } from "react"

import { DepositPendingTransferMonitor } from "@/modules/onramp/deposit/preview/components/DepositPendingTransferMonitor"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"

export const DepositJourneyMonitor: FC = () => {
  const pending = useDepositJourneyStore((state) => state.pendingTransfers)
  return pending.map((submitted) => (
    <DepositPendingTransferMonitor
      key={submitted.txHash}
      submitted={submitted}
    />
  ))
}
