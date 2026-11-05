export const withdrawalV3Stages = [
  "redeemed",
  "queued",
  "delivered",
  "processing",
  "submitted",
  "paid",
] as const

export type WithdrawalV3Status =
  | (typeof withdrawalV3Stages)[number]
  | "returned"
  | "expired"
  | "checking"

export const getBankWithdrawV3Timeline = (status: WithdrawalV3Status) => {
  if (status === "returned" || status === "expired" || status === "checking") {
    return { completed: [], remaining: [] }
  }
  const currentIndex = withdrawalV3Stages.indexOf(status)
  const stages = withdrawalV3Stages.map((key, index) => ({
    key,
    state:
      index < currentIndex || status === "paid"
        ? ("confirmed" as const)
        : index === currentIndex
          ? ("current" as const)
          : ("pending" as const),
  }))
  // The final outcome stays visible even when all previous stages are folded.
  return {
    completed: stages.filter(
      (stage) => stage.state === "confirmed" && stage.key !== "paid",
    ),
    remaining: stages.filter(
      (stage) => stage.state !== "confirmed" || stage.key === "paid",
    ),
  }
}
