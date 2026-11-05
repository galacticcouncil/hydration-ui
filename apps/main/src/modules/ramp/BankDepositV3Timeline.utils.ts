import { getBankDepositProgress } from "./BankDepositProgress.utils"
import { DepositStatus } from "./deposit.mock"

export const getBankDepositV3Timeline = (status: DepositStatus) => {
  const stages = getBankDepositProgress(status)
  // Keep the final outcome visible even when the earlier steps are collapsed.
  const completed = stages.filter(
    (stage) => stage.state === "confirmed" && stage.key !== "credited",
  )
  const remaining = stages.filter((stage) => !completed.includes(stage))
  return { completed, remaining }
}
