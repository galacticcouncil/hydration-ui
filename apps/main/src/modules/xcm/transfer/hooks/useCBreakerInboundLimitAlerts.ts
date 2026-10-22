import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBestNumber, useBlockTime } from "@/api/chain"
import { useCrossChainDepositLimit } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  getDepositLimitLockUntilDate,
  XcmLimitAlertKey,
} from "@/modules/xcm/transfer/utils/limits"
import { toBigInt, toDecimal } from "@/utils/formatting"

export const useCBreakerInboundLimitAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm", "common"])

  const { data: blockTimeMs } = useBlockTime()
  const { data: bestNumber } = useBestNumber()

  const [destChain, destAsset, destAmount] = form.watch([
    "destChain",
    "destAsset",
    "destAmount",
  ])

  const { data } = useCrossChainDepositLimit(destAsset)

  const isDeposit = destChain?.key === HYDRATION_CHAIN_KEY

  return useMemo<XcmAlert[]>(() => {
    if (
      !data ||
      !bestNumber ||
      !isDeposit ||
      !blockTimeMs ||
      !Big(destAmount || "0").gt(0)
    )
      return []

    const currentBlock = bestNumber.parachainBlockNumber
    const currentTimestamp = bestNumber.timestamp
    const lockedUntil = getDepositLimitLockUntilDate(
      data,
      currentBlock,
      currentTimestamp,
      blockTimeMs,
    )

    if (lockedUntil && data.locked) {
      return [
        {
          key: XcmLimitAlertKey.CBreakerInboundLockdown,
          title: t("limit.circuitBreaker"),
          message: t("limit.alert.cBreaker.inbound.locked", {
            locked: destAmount,
            symbol: data.symbol,
            datetime: lockedUntil,
          }),
          severity: "warning" as const,
          requiresUserConsent: t("xcm:limit.alert.acceptLockupPeriod"),
        },
      ]
    }

    if (data.limit !== null && data.headroom !== null) {
      const sentAmount = toBigInt(destAmount, data.decimals)
      if (sentAmount > data.headroom) {
        return [
          {
            key: XcmLimitAlertKey.CBreakerInboundExceeded,
            title: t("limit.circuitBreaker"),
            message: t("limit.alert.cBreaker.inbound.exceeded", {
              capacity: toDecimal(data.headroom, data.decimals),
              symbol: data.symbol,
            }),
            severity: "error" as const,
          },
        ]
      }
    }

    return []
  }, [bestNumber, data, destAmount, isDeposit, blockTimeMs, t])
}
