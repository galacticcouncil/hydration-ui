import { TransferValidationReport } from "@galacticcouncil/xc-core"
import { TFunction } from "i18next"

import type { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XcmLimitAlertKey } from "@/modules/xcm/transfer/utils/limits"
import { toDecimal } from "@/utils/formatting"

// Always blocking. Circuit breaker and ntt keys are left to the limit hooks,
// which only warn or ask for consent on some of them.
const REPORT_ERROR_KEYS = [
  "fee.insufficientBalance",
  "destFee.insufficientBalance",
  "asset.frozen",
  "account.insufficientDeposit",
  "omni.belowMinDeposit",
  "omni.connectorUnreachable",
] as const

type ReportErrorKey = (typeof REPORT_ERROR_KEYS)[number]

const isReportErrorKey = (error: string): error is ReportErrorKey => {
  return REPORT_ERROR_KEYS.includes(error as ReportErrorKey)
}

// The report keeps headroom as a raw bigint, which t() must never get.
const getHeadroom = ({
  headroom,
  decimals,
}: TransferValidationReport): string | undefined =>
  typeof headroom === "bigint" && typeof decimals === "number"
    ? toDecimal(headroom, decimals)
    : undefined

const getHubNttAlert = (
  report: TransferValidationReport,
  t: TFunction<["xcm"]>,
): XcmAlert | null => {
  const params = {
    chain: report.chain,
    symbol: report.asset,
    capacity: getHeadroom(report),
  }

  switch (report.error) {
    case "ntt.outboundLimitExceeded":
      return {
        key: XcmLimitAlertKey.WormholeOutboundExceeded,
        title: t("limit.wormholeRateLimit"),
        message: t("report.ntt.outboundLimitExceeded", params),
        severity: "error",
      }
    case "ntt.limitUnreachable":
      return {
        key: report.error,
        title: t("limit.wormholeRateLimit"),
        message: t("report.ntt.limitUnreachable", params),
        severity: "error",
      }
    case "ntt.inboundLimitExceeded":
      return {
        key: XcmLimitAlertKey.WormholeInboundExceeded,
        title: t("limit.wormholeRateLimit"),
        message: t("report.ntt.inboundLimitExceeded", params),
        severity: "warning",
      }
    default:
      return null
  }
}

/**
 * Alerts for the sdk validation report.
 *
 * `isHubMetered`: the source has no ntt manager of its own, so the sdk checks
 * the ntt limits on the hub it bridges through (Omni mints on NEAR), which the
 * wormhole limit hook does not read.
 */
export const getXcmReportAlerts = (
  report: TransferValidationReport[] | null,
  isHubMetered: boolean,
  t: TFunction<["xcm"]>,
): XcmAlert[] => {
  const alerts: XcmAlert[] = []

  for (const e of report ?? []) {
    if (isReportErrorKey(e.error)) {
      alerts.push({
        key: e.error,
        message: t(`report.${e.error}`, {
          amount: e.amount,
          symbol: e.asset,
          chain: e.chain,
        }),
        severity: "error",
      })
    } else if (isHubMetered) {
      const alert = getHubNttAlert(e, t)
      if (alert) alerts.push(alert)
    }
  }

  return alerts
}
