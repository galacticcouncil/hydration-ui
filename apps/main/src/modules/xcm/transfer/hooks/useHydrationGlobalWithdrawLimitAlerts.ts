import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBlockTimestamp } from "@/api/chain"
import { useCrossChainGlobalWithdrawLimit } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"

export const useHydrationGlobalWithdrawLimitAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])
  const { data: blockTimestamp } = useBlockTimestamp()

  const { data } = useCrossChainGlobalWithdrawLimit()

  const [destChain] = form.watch(["destChain"])

  const isWithdrawal = !!destChain && destChain.key !== HYDRATION_CHAIN_KEY

  return useMemo<XcmAlert[]>(() => {
    if (!data?.lockdown || !isWithdrawal) return []

    const durationMs = data.lockdownUntilMs
      ? Number(data.lockdownUntilMs) - Number(blockTimestamp)
      : undefined

    const lockdownText =
      durationMs && durationMs > 0
        ? t("limit.alert.window.lockdown", {
            value: durationMs,
          })
        : undefined

    return [
      {
        key: "globalWithdrawLockdown",
        message: [t("limit.alert.withdraw.locked"), lockdownText]
          .filter(Boolean)
          .join(" "),
        severity: "error" as const,
      },
    ]
  }, [blockTimestamp, data, t, isWithdrawal])
}
