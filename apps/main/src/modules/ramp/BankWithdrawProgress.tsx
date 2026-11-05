import { Stepper } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { WithdrawalStatus } from "./BankWithdraw.utils"

type BankWithdrawProgressProps = {
  status: WithdrawalStatus
  onStatusChange: (status: WithdrawalStatus) => void
}

const stages = ["pending", "processing", "completed"] as const

export const BankWithdrawProgress: FC<BankWithdrawProgressProps> = ({
  status,
  onStatusChange,
}) => {
  const { t } = useTranslation("onramp")
  if (status === "returned") return null

  return (
    <Stepper
      compact
      role="group"
      aria-label={t("bankWithdraw.tracking.previewStages")}
      steps={[
        t("bankV2.withdraw.tracking.requested"),
        t("bankV2.withdraw.tracking.sent"),
        t("bankV2.withdraw.tracking.received"),
      ]}
      activeStepIndex={
        status === "pending" ? 0 : status === "processing" ? 1 : 3
      }
      onStepClick={(index) => {
        const nextStatus = stages[index]
        if (nextStatus) onStatusChange(nextStatus)
      }}
    />
  )
}
