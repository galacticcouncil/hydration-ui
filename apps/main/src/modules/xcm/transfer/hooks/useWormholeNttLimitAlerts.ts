import { big } from "@galacticcouncil/common"
import { Ntt } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  useNttCustody,
  useNttInboundLimit,
  useNttOutboundLimit,
} from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  isNttMetered,
  XcmLimitAlertKey,
} from "@/modules/xcm/transfer/utils/limits"
import { toBigInt, toDecimal } from "@/utils/formatting"

export const useWormholeNttLimitAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])

  const [srcChain, srcAsset, destChain, destAsset, srcAmount] = form.watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "destAsset",
    "srcAmount",
  ])

  const isNttRoute =
    !!srcChain &&
    !!srcAsset &&
    !!destChain &&
    !!destAsset &&
    Ntt.isKnown(srcChain, srcAsset) &&
    Ntt.isKnown(destChain, destAsset)

  const { data: outbound } = useNttOutboundLimit(
    isNttRoute ? srcChain : null,
    isNttRoute ? srcAsset : null,
  )
  const { data: inbound } = useNttInboundLimit(
    isNttRoute ? destChain : null,
    isNttRoute ? destAsset : null,
    isNttRoute ? srcChain : null,
  )
  // A locking destination releases only what it previously locked; the
  // source burn goes through regardless, so this fails closed like the sdk.
  const { data: custody, isError: isCustodyUnreachable } = useNttCustody(
    isNttRoute ? destChain : null,
    isNttRoute ? destAsset : null,
  )

  const isEnabled = Big(srcAmount || "0").gt(0)

  return useMemo<XcmAlert[]>(() => {
    if (
      !isNttRoute ||
      !isEnabled ||
      !srcChain ||
      !srcAsset ||
      !destChain ||
      !destAsset
    ) {
      return []
    }

    const srcDecimals = srcChain.getAssetDecimals(srcAsset)
    const destDecimals = destChain.getAssetDecimals(destAsset)
    if (srcDecimals === undefined || destDecimals === undefined) return []

    const amount = toBigInt(srcAmount, srcDecimals)
    if (amount <= 0n) return []

    const delivered = big.convertDecimals(amount, srcDecimals, destDecimals)

    const alerts: XcmAlert[] = []

    if (outbound && isNttMetered(outbound) && amount > outbound.capacity) {
      alerts.push({
        key: XcmLimitAlertKey.WormholeOutboundExceeded,
        title: t("limit.wormholeRateLimit"),
        message: t("limit.alert.wormhole.outboundExceeded", {
          chainName: srcChain.name,
          capacity: toDecimal(outbound.capacity, srcDecimals),
          symbol: srcAsset.originSymbol,
        }),
        severity: "error",
      })
    }

    if (isCustodyUnreachable) {
      alerts.push({
        key: XcmLimitAlertKey.WormholeCustodyUnreachable,
        title: t("limit.wormholeCustody"),
        message: t("limit.alert.wormhole.custodyUnreachable", {
          destChainName: destChain.name,
          symbol: destAsset.originSymbol,
        }),
        severity: "error",
      })
    } else if (custody !== undefined && custody !== null) {
      if (delivered > custody) {
        alerts.push({
          key: XcmLimitAlertKey.WormholeCustodyExceeded,
          title: t("limit.wormholeCustody"),
          message: t("limit.alert.wormhole.custodyExceeded", {
            srcChainName: srcChain.name,
            destChainName: destChain.name,
            capacity: toDecimal(custody, destDecimals),
            symbol: destAsset.originSymbol,
          }),
          severity: "error",
        })
      }
    }

    if (inbound && isNttMetered(inbound)) {
      if (delivered > inbound.capacity) {
        alerts.push({
          key: XcmLimitAlertKey.WormholeInboundExceeded,
          title: t("limit.wormholeRateLimit"),
          message: t("limit.alert.wormhole.inboundExceeded", {
            srcChainName: srcChain.name,
            destChainName: destChain.name,
            capacity: toDecimal(inbound.capacity, destDecimals),
            symbol: destAsset.originSymbol,
          }),
          severity: "warning",
        })
      }
    }

    return alerts
  }, [
    custody,
    destAsset,
    destChain,
    inbound,
    isCustodyUnreachable,
    isEnabled,
    isNttRoute,
    outbound,
    srcAmount,
    srcAsset,
    srcChain,
    t,
  ])
}
