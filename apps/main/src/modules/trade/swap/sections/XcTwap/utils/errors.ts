import type { XcIntentsError } from "@galacticcouncil/xc-intents"

export type XcTwapErrorView = {
  /** `destAddress` field error */
  readonly recipient: "recipientRejected" | null
  /** `sellAmount` field error */
  readonly sellAmount: "minBudget" | "belowEd" | null
  /** Blocking alert under the form */
  readonly alert: "unpriced" | "estimateFailed" | null
}

export const XC_TWAP_NO_ERRORS: XcTwapErrorView = {
  recipient: null,
  sellAmount: null,
  alert: null,
}

/** Where each estimate error shows on the form. */
export const getXcTwapErrorView = (
  errors: ReadonlyArray<`${XcIntentsError}`>,
  hasThrown = false,
): XcTwapErrorView => {
  if (hasThrown) return { ...XC_TWAP_NO_ERRORS, alert: "estimateFailed" }

  const has = (error: `${XcIntentsError}`) => errors.includes(error)

  // The rest can't occur given the form's rules
  const isOther = errors.some(
    (error) =>
      error !== "RecipientRejected" &&
      error !== "Unpriced" &&
      error !== "BelowExistentialDeposit" &&
      error !== "OrderTooSmall",
  )

  return {
    recipient: has("RecipientRejected") ? "recipientRejected" : null,
    sellAmount: has("OrderTooSmall")
      ? "minBudget"
      : has("BelowExistentialDeposit")
        ? "belowEd"
        : null,
    alert: has("Unpriced") ? "unpriced" : isOther ? "estimateFailed" : null,
  }
}
