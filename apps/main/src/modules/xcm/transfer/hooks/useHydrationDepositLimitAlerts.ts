import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBestNumber } from "@/api/chain"
import { useCrossChainDepositLimit } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getDepositLimitPeriodWindow } from "@/modules/xcm/transfer/utils/limits"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale, toDecimal } from "@/utils/formatting"

export const useHydrationDepositLimitAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])

  const { slotDurationMs } = useRpcProvider()
  const { data: bestNumber } = useBestNumber()

  const [destChain, destAsset, destAmount] = form.watch([
    "destChain",
    "destAsset",
    "destAmount",
  ])

  const { data } = useCrossChainDepositLimit(destAsset, destChain)

  return useMemo(() => {
    if (!data) return []

    const periodWindowText = (() => {
      if (!bestNumber) return undefined
      const currentBlock = bestNumber.parachainBlockNumber
      const periodWindow = getDepositLimitPeriodWindow(
        data,
        currentBlock,
        slotDurationMs,
      )
      if (!periodWindow) return undefined
      switch (periodWindow.type) {
        case "lockdown":
          return t("xcm:depositLimit.alert.window.lockdown", {
            value: periodWindow.durationMs,
          })
        case "reset":
          return t("xcm:depositLimit.alert.window.reset", {
            value: periodWindow.durationMs,
          })
        case "expired":
          return undefined
      }
    })()

    if (data.locked) {
      return [
        {
          key: "depositLocked",
          message: [
            t("xcm:depositLimit.alert.amount.locked", { symbol: data.symbol }),
            periodWindowText,
          ]
            .filter(Boolean)
            .join(" "),
          severity: "error" as const,
        },
      ]
    }

    if (data.limit !== null && data.headroom !== null && destAmount) {
      const destAmountRaw = BigInt(scale(destAmount, data.decimals))
      if (destAmountRaw > data.headroom) {
        const formattedHeadroom = toDecimal(data.headroom, data.decimals)

        return [
          {
            key: "depositExceeded",
            message: [
              t("xcm:depositLimit.alert.amount.exceeded", {
                amount: formattedHeadroom,
                symbol: data.symbol,
              }),
              periodWindowText,
            ]
              .filter(Boolean)
              .join(" "),
            severity: "info" as const,
            requiresUserConsent: t("xcm:depositLimit.alert.acceptLockupPeriod"),
          },
        ]
      }
    }

    return []
  }, [data, destAmount, t, bestNumber, slotDurationMs])
}
