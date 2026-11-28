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
  "omni.belowMinWithdraw",
  "omni.connectorUnreachable",
  "psm.unreachable",
  "psm.depositsPaused",
  "psm.depositLimitExceeded",
  // A mint over the headroom or a payout over the allowance queues instead of
  // reverting, but the app can't follow or cancel a queued entry
  "psm.mintHeadroomExceeded",
  "psm.redeemPaused",
  "psm.invalidRecipient",
  "psm.belowMinRedeem",
  "psm.redeemLimitExceeded",
  "psm.payoutLimitExceeded",
] as const

type ReportErrorKey = (typeof REPORT_ERROR_KEYS)[number]

const isReportErrorKey = (error: string): error is ReportErrorKey => {
  return REPORT_ERROR_KEYS.includes(error as ReportErrorKey)
}

// A PSM limit reads 0 while its side is paused or not open yet (the redeem
// limit stays 0 until the first mint), so there is nothing to send under
const PSM_UNAVAILABLE_KEYS = {
  "psm.depositLimitExceeded": "psm.depositsUnavailable",
  "psm.mintHeadroomExceeded": "psm.mintUnavailable",
  "psm.redeemLimitExceeded": "psm.redeemUnavailable",
  "psm.payoutLimitExceeded": "psm.payoutUnavailable",
} as const satisfies Partial<Record<ReportErrorKey, string>>

const isPsmLimitKey = (
  error: ReportErrorKey,
): error is keyof typeof PSM_UNAVAILABLE_KEYS => error in PSM_UNAVAILABLE_KEYS

const getReportMessageKey = (
  error: ReportErrorKey,
  { headroom }: TransferValidationReport,
) =>
  headroom === 0n && isPsmLimitKey(error) ? PSM_UNAVAILABLE_KEYS[error] : error

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
    case "ntt.custodyExceeded":
      return {
        key: XcmLimitAlertKey.WormholeCustodyExceeded,
        title: t("limit.wormholeCustody"),
        message: t("report.ntt.custodyExceeded", params),
        severity: "error",
      }
    case "ntt.custodyUnreachable":
      return {
        key: XcmLimitAlertKey.WormholeCustodyUnreachable,
        title: t("limit.wormholeCustody"),
        message: t("report.ntt.custodyUnreachable", params),
        severity: "error",
      }
    default:
      return null
  }
}

/**
 * Alerts for the sdk validation report.
 *
 * `isHubMetered`: an end has no ntt manager of its own, so the sdk checks the
 * ntt limits on NEAR, the hub it bridges through (an Omni deposit or
 * withdrawal), which the wormhole limit hook does not read.
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
        message: t(`report.${getReportMessageKey(e.error, e)}`, {
          amount: e.amount,
          symbol: e.asset,
          chain: e.chain,
          capacity: getHeadroom(e),
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
