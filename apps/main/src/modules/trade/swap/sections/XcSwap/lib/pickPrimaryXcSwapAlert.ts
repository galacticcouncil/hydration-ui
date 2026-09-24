import { XcSwapError } from "@galacticcouncil/xc-swap"

import { XcSwapAlert } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAlerts"

export const XC_SWAP_ERROR_PRIORITY: readonly XcSwapError[] = [
  XcSwapError.RailPaused,
  XcSwapError.RailRateLimited,
  XcSwapError.RecipientInvalid,
  XcSwapError.AmountTooLow,
  XcSwapError.RelayFeeExceedsAmount,
  XcSwapError.RelayFeeTooHigh,
  XcSwapError.MinWethNotMet,
  XcSwapError.BelowDeliveryPrice,
  XcSwapError.BelowTrimUnit,
  XcSwapError.QuoteFailed,
]

const ALERT_SOURCE_PRIORITY = [
  "wallet-incompatible",
  "src-asset-unsupported",
  "quote-error",
] as const

export const pickPrimaryXcSwapError = (
  errors: readonly XcSwapError[],
): XcSwapError | null => {
  for (const error of XC_SWAP_ERROR_PRIORITY) {
    if (errors.includes(error)) {
      return error
    }
  }

  return errors[0] ?? null
}

export const pickPrimaryXcSwapAlert = (
  alerts: readonly XcSwapAlert[],
): XcSwapAlert | null => {
  if (!alerts.length) {
    return null
  }

  for (const key of ALERT_SOURCE_PRIORITY) {
    const alert = alerts.find((candidate) => candidate.key === key)

    if (alert) {
      return alert
    }
  }

  const sdkAlerts = alerts.filter((alert) =>
    alert.key.startsWith("xc-trade-error-"),
  )

  if (!sdkAlerts.length) {
    return alerts[0] ?? null
  }

  const sdkErrors = sdkAlerts.map(
    (alert) => alert.key.replace("xc-trade-error-", "") as XcSwapError,
  )
  const primaryError = pickPrimaryXcSwapError(sdkErrors)

  if (!primaryError) {
    return sdkAlerts[0] ?? null
  }

  return (
    sdkAlerts.find((alert) => alert.key === `xc-trade-error-${primaryError}`) ??
    sdkAlerts[0] ??
    null
  )
}
