import Big from "big.js"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useWormholeNotionalUsd, useWormholeRateLimit } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransferConfigs } from "@/modules/xcm/transfer/hooks/useXcmTransferConfigs"
import {
  getWormholeEmitterChain,
  getWormholeEmitterId,
  XcmLimitAlertKey,
} from "@/modules/xcm/transfer/utils/limits"

export const useWormholeGovernorLimitAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])

  const [srcChain, srcAsset, destChain, destAsset, srcAmount, bridgeProvider] =
    form.watch([
      "srcChain",
      "srcAsset",
      "destChain",
      "destAsset",
      "srcAmount",
      "bridgeProvider",
    ])

  const config = useXcmTransferConfigs(
    srcAsset,
    srcChain,
    destChain,
    destAsset,
    bridgeProvider,
  )

  const emitterChain = getWormholeEmitterChain(srcChain, config?.origin.route)
  const wormholeId = getWormholeEmitterId(srcChain, config?.origin.route)

  const { data: rateLimit } = useWormholeRateLimit(wormholeId)

  const { data: notional } = useWormholeNotionalUsd(
    srcChain,
    srcAsset,
    srcAmount,
  )

  const isGoverned =
    wormholeId !== null && rateLimit?.configured === true && !!notional

  const isEnabled = Big(srcAmount || "0").gt(0)

  return useMemo<XcmAlert[]>(() => {
    if (!isGoverned || !isEnabled) return []

    if (notional > rateLimit.maxTransactionSize) {
      return [
        {
          key: XcmLimitAlertKey.WormholeBigTransaction,
          title: t("limit.wormholeGovernor"),
          message: t("limit.alert.wormhole.bigTransaction", {
            notional,
            max: rateLimit.maxTransactionSize,
            chainName: emitterChain?.name ?? "",
          }),
          severity: "warning",
        },
      ]
    }

    if (notional > rateLimit.availableNotional) {
      return [
        {
          key: XcmLimitAlertKey.WormholeExceeded,
          title: t("limit.wormholeGovernor"),
          message: t("limit.alert.wormhole.exceeded", {
            notional,
            max: rateLimit.availableNotional,
            chainName: emitterChain?.name ?? "",
          }),
          severity: "warning",
        },
      ]
    }

    return []
  }, [
    emitterChain?.name,
    isGoverned,
    notional,
    rateLimit?.availableNotional,
    rateLimit?.maxTransactionSize,
    isEnabled,
    t,
  ])
}
