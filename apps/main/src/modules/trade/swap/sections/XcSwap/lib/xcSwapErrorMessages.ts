import { XcSwapError } from "@galacticcouncil/xc-swap"
import { TFunction } from "i18next"

import { Trade } from "@/api/trade"

type OnChainSwapError = Trade["swaps"][number]["errors"][number]

export const getOnChainSwapErrorMessage = (
  error: OnChainSwapError,
  t: TFunction<"trade">,
): string => {
  switch (error) {
    case "InsufficientTradingAmount":
      return t("market.error.insufficientTradingAmount")
    case "MaxOutRatioExceeded":
      return t("market.error.maxOutRatioExceeded")
    case "MaxInRatioExceeded":
      return t("market.error.maxInRatioExceeded")
    case "TradeNotAllowed":
      return t("market.error.tradeNotAllowed")
    default:
      return error
  }
}

export const getXcSwapErrorMessage = (
  error: XcSwapError,
  t: TFunction<"trade">,
): string => {
  switch (error) {
    case XcSwapError.MinWethNotMet:
      return t("xc.swap.error.minWethNotMet")
    case XcSwapError.RelayFeeTooHigh:
      return t("xc.swap.error.relayFeeTooHigh")
    case XcSwapError.RelayFeeExceedsAmount:
      return t("xc.swap.error.relayFeeExceedsAmount")
    case XcSwapError.BelowDeliveryPrice:
      return t("xc.swap.error.belowDeliveryPrice")
    case XcSwapError.BelowTrimUnit:
      return t("xc.swap.error.belowTrimUnit")
    case XcSwapError.RailPaused:
      return t("xc.swap.error.railPaused")
    case XcSwapError.RailRateLimited:
      return t("xc.swap.error.railRateLimited")
    case XcSwapError.AmountTooLow:
      return t("xc.swap.error.amountTooLow")
    case XcSwapError.RecipientInvalid:
      return t("xc.swap.error.recipientInvalid")
    case XcSwapError.QuoteFailed:
      return t("xc.swap.error.quoteFailed")
    default:
      return error
  }
}
