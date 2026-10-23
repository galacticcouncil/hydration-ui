import { FC } from "react"

import { DepositTransferProgress } from "@/modules/onramp/deposit/preview/components/DepositTransferProgress"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"

export const DepositTracking: FC = () => {
  const submitted = useDepositJourneyStore((state) => state.submitted)
  return submitted ? <DepositTransferProgress submitted={submitted} /> : null
}
