import { getChainAssetId, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBlockTimestamp } from "@/api/chain"
import { useCrossChainGlobalWithdrawLimit } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XcmLimitAlertKey } from "@/modules/xcm/transfer/utils/limits"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

export const useHydrationGlobalWithdrawLimitAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])
  const { data: blockTimestamp } = useBlockTimestamp()
  const { native } = useAssets()

  const { data } = useCrossChainGlobalWithdrawLimit()

  const [srcChain, srcAsset, srcAmount] = form.watch([
    "srcChain",
    "srcAsset",
    "srcAmount",
  ])

  const isWithdrawal = srcChain?.key === HYDRATION_CHAIN_KEY
  const isEnabled = Big(srcAmount || "0").gt(0)

  const srcAssetId =
    srcChain && srcAsset
      ? getChainAssetId(srcChain, srcAsset).toString()
      : undefined

  const { price: nativePrice, isValid: isNativePriceValid } = useAssetPrice(
    native.id,
  )
  const { price: srcPrice, isValid: isSrcPriceValid } =
    useAssetPrice(srcAssetId)

  const headroomAmount = data?.headroom
    ? toDecimal(data.headroom, native.decimals)
    : null

  const headroomUsd =
    isNativePriceValid && headroomAmount
      ? Big(headroomAmount).times(nativePrice)
      : null

  const withdrawalUsd =
    isSrcPriceValid && srcAmount ? Big(srcAmount).times(srcPrice) : null

  return useMemo<XcmAlert[]>(() => {
    if (!isEnabled || !isWithdrawal || !data?.configured) return []

    if (data.lockdown) {
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
          key: XcmLimitAlertKey.GlobalWithdrawLockdown,
          title: t("limit.circuitBreaker"),
          message: [t("limit.alert.withdraw.locked"), lockdownText]
            .filter(Boolean)
            .join(" "),
          severity: "error",
        },
      ]
    }

    if (withdrawalUsd && headroomUsd && withdrawalUsd.gt(headroomUsd)) {
      const lockedUsd = Big(withdrawalUsd).minus(headroomUsd).toString()
      const lockedUntilMs = data.lockdownUntilMs
        ? Number(data.lockdownUntilMs)
        : Number(data.lastUpdateMs) + Number(data.windowMs)
      const lockedUntil =
        lockedUntilMs > Number(blockTimestamp)
          ? new Date(lockedUntilMs)
          : undefined

      return [
        {
          key: XcmLimitAlertKey.GlobalWithdrawExceeded,
          title: t("limit.circuitBreaker"),
          message: t("limit.alert.withdraw.exceeded", {
            remaining: headroomUsd,
            locked: lockedUsd,
            datetime: lockedUntil,
          }),
          severity: "warning",
        },
      ]
    }

    return []
  }, [
    blockTimestamp,
    data,
    headroomUsd,
    isEnabled,
    isWithdrawal,
    t,
    withdrawalUsd,
  ])
}
