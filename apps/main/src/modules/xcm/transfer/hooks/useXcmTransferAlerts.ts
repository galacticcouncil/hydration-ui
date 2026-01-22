import { Transfer } from "@galacticcouncil/xc-sdk"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { xcmTransferReportQuery } from "@/api/xcm"
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

export const useXcmTransferAlerts = (transfer: Transfer | null): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])
  const { data: transferReport } = useQuery(xcmTransferReportQuery(transfer))
  return useMemo(() => {
    if (!transferReport) return []
    const alerts: XcmAlert[] = []
    for (const e of transferReport) {
      if (isReportErrorKey(e.error)) {
        alerts.push({
          key: e.error,
          message: t(`report.${e.error}`, {
            amount: e.amount,
            symbol: e.asset,
            chain: e.chain,
          }),
        })
      }
    }
    return alerts
  }, [t, transferReport])
}
