import type { NearTxOutcome } from "@galacticcouncil/xc-core"
import type { NearFunctionCall, NearTxObserver } from "@galacticcouncil/xc-sdk"

// Relative: the app's tests load this file, and read "@/" as the app's src
import { getWalletErrorMessage } from "./errors"

const NEAR_TX_FAILED = "NEAR transaction failed"
const NEAR_TX_NO_OUTCOME = "The wallet returned no transaction outcome"

/** A NEP-518 account: the 0x… account of an Ethereum wallet on NEAR. */
export const isEthImplicitAccount = (accountId: string) =>
  /^0x[0-9a-f]{40}$/.test(accountId)

/**
 * A call's actions as a NEP-518 account sends them, one per transaction.
 *
 * - Its wallet contract runs a single action per transaction
 * - A `storage_deposit` registration right ahead of a `near_deposit` is folded
 *   into it, saving a confirmation: w-near's `near_deposit` registers a new
 *   caller out of its deposit, and the deployed wrap.near has that path
 */
export const toSingleActions = (actions: NearFunctionCall[]) =>
  actions.reduce<NearFunctionCall[]>((result, action) => {
    const previous = result[result.length - 1]
    if (
      action.methodName === "near_deposit" &&
      previous?.methodName === "storage_deposit" &&
      previous.args.registration_only === true
    ) {
      result[result.length - 1] = {
        ...action,
        gas: previous.gas + action.gas,
        deposit: previous.deposit + action.deposit,
      }
    } else {
      result.push(action)
    }
    return result
  }, [])

export type NearTxCallbacks = {
  onSubmitted: (txHash: string) => void
  onSuccess: (outcome: NearTxOutcome) => void
  onError: (error: string) => void
  onFinalized: (outcome: NearTxOutcome) => void
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
      ? getWalletErrorMessage(failure.error) || NEAR_TX_FAILED
      : NEAR_TX_NO_OUTCOME
    onError(message)
    throw failure?.error instanceof Error ? failure.error : new Error(message)
  }

  if (failure) {
    onError(getWalletErrorMessage(failure.error) || NEAR_TX_FAILED)
  } else {
    onSuccess(outcome)
  }

  onFinalized(outcome)
  return outcome
}
