import { Ntt, TransferValidationReport } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBasejumpPoolAlerts } from "@/modules/xcm/transfer/hooks/useBasejumpPoolAlerts"
import { useCBreakerInboundLimitAlerts } from "@/modules/xcm/transfer/hooks/useCBreakerInboundLimitAlerts"
import { useCBreakerOutboundLimitAlerts } from "@/modules/xcm/transfer/hooks/useCBreakerOutboundLimitAlerts"
import { useHydrationEvmBindingAlert } from "@/modules/xcm/transfer/hooks/useHydrationEvmBindingAlert"
import { useWormholeNttLimitAlerts } from "@/modules/xcm/transfer/hooks/useWormholeNttLimitAlerts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { pickXcmLimitAlert } from "@/modules/xcm/transfer/utils/limits"
import { getXcmReportAlerts } from "@/modules/xcm/transfer/utils/report"

export const useXcmTransferAlerts = (
  form: UseFormReturn<XcmFormValues>,
  transferReport: TransferValidationReport[] | null,
  requiresEvmBinding: boolean,
): { alerts: XcmAlert[]; isLoading: boolean } => {
  const { t } = useTranslation(["xcm"])

  const [srcChain, srcAsset] = form.watch(["srcChain", "srcAsset"])

  const isHubMetered =
    !!srcChain && !!srcAsset && !Ntt.isKnown(srcChain, srcAsset)

  const cBreakerInboundLimitAlerts = useCBreakerInboundLimitAlerts(form)
  const cBreakerOutboundLimitAlerts = useCBreakerOutboundLimitAlerts(form)
  const wormholeNttLimitAlerts = useWormholeNttLimitAlerts(form)
  const basejumpPoolAlerts = useBasejumpPoolAlerts(form)
  const { alerts: evmBindingAlerts, isLoading: isLoadingEvmBinding } =
    useHydrationEvmBindingAlert(form, requiresEvmBinding)

  const alerts = useMemo<XcmAlert[]>(() => {
    const reportAlerts = getXcmReportAlerts(transferReport, isHubMetered, t)
    const reportErrors = reportAlerts.filter((a) => a.severity === "error")
    if (reportErrors.length) return reportErrors
    if (evmBindingAlerts.length) return evmBindingAlerts

    // A report warning (the hub's inbound limit) ranks with the limit alerts
    // instead of hiding them.
    const limitAlert = pickXcmLimitAlert([
      ...cBreakerInboundLimitAlerts,
      ...cBreakerOutboundLimitAlerts,
      ...wormholeNttLimitAlerts,
      ...reportAlerts,
      ...basejumpPoolAlerts,
    ])
    return limitAlert ? [limitAlert] : []
  }, [
    t,
    transferReport,
    isHubMetered,
    cBreakerInboundLimitAlerts,
    cBreakerOutboundLimitAlerts,
    wormholeNttLimitAlerts,
    basejumpPoolAlerts,
    evmBindingAlerts,
  ])

  return { alerts, isLoading: isLoadingEvmBinding }
}
