import { DepositStatus } from "./deposit.mock"

export const getBankDepositProgress = (status?: DepositStatus) => {
  if (!status || status === "Returned") return []
  const stages: DepositStatus[] = [
    "Received by Bridge",
    "Sent to Base",
    "Arrived",
    "Depositing",
    "Queued on Hydration",
    "Credited",
  ]
  if (status === "Waiting for deposit limit") stages.splice(3, 0, status)
  const keys = {
    "Received by Bridge": "received",
    "Sent to Base": "sent",
    Arrived: "arrived",
    "Waiting for deposit limit": "capacity",
    Depositing: "depositing",
    "Queued on Hydration": "queued",
    Credited: "credited",
    Returned: "returned",
  } as const satisfies Record<DepositStatus, string>
  const active = stages.indexOf(status)
  return stages.map((label, index) => ({
    label,
    key: keys[label],
    state:
      index < active || (label === "Credited" && status === "Credited")
        ? ("confirmed" as const)
        : index === active
          ? ("current" as const)
          : ("pending" as const),
  }))
}
