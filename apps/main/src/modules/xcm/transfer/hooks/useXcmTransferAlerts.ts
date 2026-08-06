import { TransferValidationReport } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCBreakerInboundLimitAlerts } from "@/modules/xcm/transfer/hooks/useCBreakerInboundLimitAlerts"
import { useCBreakerOutboundLimitAlerts } from "@/modules/xcm/transfer/hooks/useCBreakerOutboundLimitAlerts"
import { useWormholeNttLimitAlerts } from "@/modules/xcm/transfer/hooks/useWormholeNttLimitAlerts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { pickXcmLimitAlert } from "@/modules/xcm/transfer/utils/limits"

const REPORT_ERROR_KEYS = [
  "fee.insufficientBalance",
  "destFee.insufficientBalance",
  "asset.frozen",
  "account.insufficientDeposit",
] as const

type ReportErrorKey = (typeof REPORT_ERROR_KEYS)[number]

const isReportErrorKey = (error: string): error is ReportErrorKey => {
  return REPORT_ERROR_KEYS.includes(error as ReportErrorKey)
}

export const useXcmTransferAlerts = (
  form: UseFormReturn<XcmFormValues>,
  transferReport: TransferValidationReport[] | null,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])

  const cBreakerInboundLimitAlerts = useCBreakerInboundLimitAlerts(form)
  const cBreakerOutboundLimitAlerts = useCBreakerOutboundLimitAlerts(form)
  const wormholeNttLimitAlerts = useWormholeNttLimitAlerts(form)

  return useMemo<XcmAlert[]>(() => {
    const transferReportAlerts: XcmAlert[] = []
    if (transferReport) {
      for (const e of transferReport) {
        if (isReportErrorKey(e.error)) {
          transferReportAlerts.push({
            key: e.error,
            message: t(`report.${e.error}`, {
              amount: e.amount,
              symbol: e.asset,
              chain: e.chain,
            }),
            severity: "error",
          })
        }
      }
    }
    if (transferReportAlerts.length) return transferReportAlerts

    const limitAlert = pickXcmLimitAlert([
      ...cBreakerInboundLimitAlerts,
      ...cBreakerOutboundLimitAlerts,
      ...wormholeNttLimitAlerts,
    ])
    return limitAlert ? [limitAlert] : []
  }, [
    t,
    transferReport,
    cBreakerInboundLimitAlerts,
    cBreakerOutboundLimitAlerts,
    wormholeNttLimitAlerts,
  ])
}
