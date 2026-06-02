import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBestNumber } from "@/api/chain"
import { useCrossChainDepositLimit } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getDepositLimitPeriodWindow } from "@/modules/xcm/transfer/utils/limits"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toBigInt, toDecimal } from "@/utils/formatting"

export const useHydrationDepositLimitAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm", "common"])

  const { slotDurationMs } = useRpcProvider()
  const { data: bestNumber } = useBestNumber()

  const [destChain, destAsset, destAmount] = form.watch([
    "destChain",
    "destAsset",
    "destAmount",
  ])

  const { data } = useCrossChainDepositLimit(destAsset)

  const isDeposit = destChain?.key === HYDRATION_CHAIN_KEY

  return useMemo<XcmAlert[]>(() => {
    if (!data || !bestNumber || !isDeposit || !Big(destAmount || "0").gt(0))
      return []

    const currentBlock = bestNumber.parachainBlockNumber
    const currentTimestamp = bestNumber.timestamp
    const periodWindow = getDepositLimitPeriodWindow(
      data,
      currentBlock,
      slotDurationMs,
    )

    const lockedUntil =
      periodWindow &&
      periodWindow.type !== "expired" &&
      periodWindow.durationMs > 0
        ? new Date(currentTimestamp + periodWindow.durationMs)
        : undefined

    if (lockedUntil && data.locked) {
      return [
        {
          key: "depositLocked",
          message: t("xcm:limit.alert.deposit.locked", {
            locked: destAmount,
            symbol: data.symbol,
            datetime: lockedUntil,
          }),
          severity: "warning" as const,
          requiresUserConsent: t("xcm:limit.alert.acceptLockupPeriod"),
        },
      ]
    }

    if (lockedUntil && data.limit && data.headroom) {
      const sentAmount = toBigInt(destAmount, data.decimals)
      if (sentAmount > data.headroom) {
        const lockedAmount = sentAmount - data.headroom
        return [
          {
            key: "depositExceeded",
            message: t("xcm:limit.alert.deposit.exceeded", {
              remaining: toDecimal(data.headroom, data.decimals),
              locked: toDecimal(lockedAmount, data.decimals),
              symbol: data.symbol,
              datetime: lockedUntil,
            }),
            severity: "warning" as const,
          },
        ]
      }
    }

    return []
  }, [bestNumber, data, destAmount, isDeposit, slotDurationMs, t])
}
