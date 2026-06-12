import { TransferValidationReport } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useHydrationDepositLimitAlerts } from "@/modules/xcm/transfer/hooks/useHydrationDepositLimitAlerts"
import { useHydrationGlobalWithdrawLimitAlerts } from "@/modules/xcm/transfer/hooks/useHydrationGlobalWithdrawLimitAlerts"
import { useWormholeGovernorLimitAlerts } from "@/modules/xcm/transfer/hooks/useWormholeGovernorLimitAlerts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"

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

  const depositLimitAlerts = useHydrationDepositLimitAlerts(form)
  const globalWithdrawLimitAlerts = useHydrationGlobalWithdrawLimitAlerts(form)
  const wormholeGovernorLimitAlerts = useWormholeGovernorLimitAlerts(form)

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
    return [
      ...transferReportAlerts,
      ...depositLimitAlerts,
      ...globalWithdrawLimitAlerts,
      ...wormholeGovernorLimitAlerts,
    ]
  }, [
    t,
    transferReport,
    depositLimitAlerts,
    globalWithdrawLimitAlerts,
    wormholeGovernorLimitAlerts,
  ])
}
