import type { NearTxOutcome } from "@galacticcouncil/xc-core"
import type { NearTxObserver } from "@galacticcouncil/xc-sdk"

const NEAR_TX_FAILED = "NEAR transaction failed"
const NEAR_TX_NO_OUTCOME = "The wallet returned no transaction outcome"

export type NearTxCallbacks = {
  onSubmitted: (txHash: string) => void
  onSuccess: (outcome: NearTxOutcome) => void
  onError: (error: string) => void
  onFinalized: (outcome: NearTxOutcome) => void
}

// Wallets reject with their own value, often a string rather than an Error
export const getNearErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    return err.message
  }
  return ""
}

/**
 * Reports a NEAR send through the transaction callbacks.
 *
 * - The sdk signer never rejects: a rejection and a failed receipt both
 *   arrive as `onError`, and the outcome comes before its receipts are
 *   checked, so success is known only once the send settles
 * - A failure with no outcome is thrown after it is reported, as the other
 *   signers do
 */
export const reportNearSend = async (
  send: (observer: NearTxObserver) => Promise<void>,
  { onSubmitted, onSuccess, onError, onFinalized }: NearTxCallbacks,
): Promise<NearTxOutcome> => {
  const result: { outcome?: NearTxOutcome; failure?: { error: unknown } } = {}

  await send({
    onTransactionSend: onSubmitted,
    onStatus: (outcome) => {
      result.outcome = outcome
    },
    onError: (error) => {
      result.failure = { error }
    },
  })

  const { outcome, failure } = result

  if (!outcome) {
    // A wallet that hands back no outcome leaves nothing to follow
    const message = failure
      ? getNearErrorMessage(failure.error) || NEAR_TX_FAILED
      : NEAR_TX_NO_OUTCOME
    onError(message)
    throw failure?.error instanceof Error ? failure.error : new Error(message)
  }

  if (failure) {
    onError(getNearErrorMessage(failure.error) || NEAR_TX_FAILED)
  } else {
    onSuccess(outcome)
  }

  onFinalized(outcome)
  return outcome
}
