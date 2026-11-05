import { FC } from "react"

import { useDepositProgress } from "@/modules/onramp/deposit/preview/useDepositProgress"
import { SubmittedDeposit } from "@/modules/onramp/deposit/store/useDepositJourneyStore"

type DepositPendingTransferMonitorProps = { submitted: SubmittedDeposit }

export const DepositPendingTransferMonitor: FC<
  DepositPendingTransferMonitorProps
> = ({ submitted }) => {
  useDepositProgress(submitted)
  return null
}
