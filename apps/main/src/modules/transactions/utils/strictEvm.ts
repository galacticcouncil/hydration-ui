import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { isEthereumSigner } from "@galacticcouncil/web3-connect"
import type {
  PreparedEvmTransaction,
  PreparedSendOutcome,
} from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"
import { CallType } from "@galacticcouncil/xc-core"
import { keccak256, stringToHex } from "viem"
import { create } from "zustand"

import { TxOptions } from "@/modules/transactions/types"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { SingleTransaction, StrictEvmWrapRefusal } from "@/states/transactions"

/*
 * The strict option of createTransaction (StrictEvmOptions). Why it exists: a
 * server-prepared redeem carries no nonce of its own, so the same calldata
 * signed twice is two burns (hydration-ramp docs/api/README.md rule 11). The
 * guarantees and where each is enforced:
 * 1. Route: useSignAndSubmit hands a strict transaction to
 *    signAndSubmitStrictEvmTx before any other route is considered, whatever
 *    the fee asset; it refuses any signer that is not an EthereumSigner, and
 *    EthereumSigner.sendPreparedTransaction makes ONE eth_sendTransaction.
 * 2. No wrapping: useWrapTransaction never wraps a strict transaction and
 *    stamps `wrapRefusal` when the account would need it; the send refuses a
 *    stamped refusal and any `tx` that is not the unchanged prepared call.
 * 3. Sender: refused unless prepared.from equals sessionAddress and the
 *    signer's address; the signer also checks the wallet's live eth_accounts.
 * 4. Fields: to, data, value and chainId go out as given; a chainId that
 *    differs from the wallet's refuses (no automatic chain switch).
 * 5. Once: the ledger below lets a prepared transaction reach the wallet again
 *    ONLY after an explicit 4001 with no hash; every other outcome, including a
 *    refusal before the prompt, is final. The review shows "Try again" on the
 *    same condition (ReviewStrictEvmStatus).
 * 6. Sequencing: `after` must have a successful receipt in the ledger.
 * 7. Hash out: `onHash` receives the hash the moment the wallet returns it.
 * 8. Memory only: the ledger keeps digests, never a transaction; strict
 *    transactions skip the fee and payment-info queries (their keys carry the
 *    call) and the review shows no call data; error text is fixed.
 */

// Fixed text (the signer's own messages are fixed too): onError text reaches
// toasts, which are persisted.
const STRICT_REFUSED = "Prepared transaction refused before sending"
const STRICT_FAILED = "Prepared transaction: the wallet did not confirm a send"

/**
 * - claimed: taken by a send, checks running, the wallet not asked yet
 * - refused: refused before the wallet was asked; nothing was sent
 * - prompted: eth_sendTransaction called, no answer yet
 * - rejected: the wallet's own error carried 4001 and no hash came back
 * - failed: no hash and not 4001; the wallet may have broadcast
 * - sent: a hash came back, receipt pending
 * - succeeded / reverted / unknown: what the receipt wait observed
 */
export type StrictSendState =
  | "claimed"
  | "refused"
  | "prompted"
  | "rejected"
  | "failed"
  | "sent"
  | "succeeded"
  | "reverted"
  | "unknown"

type StrictEvmLedger = {
  entries: Record<string, StrictSendState>
  set: (digest: string, state: StrictSendState) => void
  /** Takes a prepared transaction for one send: only a new one or one the user declined. */
  claim: (digest: string) => boolean
}

/** Memory only (no persist, no sync): a digest per prepared transaction, never the transaction. */
export const useStrictEvmLedger = create<StrictEvmLedger>()((set, get) => ({
  entries: {},
  set: (digest, state) =>
    set((ledger) => ({ entries: { ...ledger.entries, [digest]: state } })),
  claim: (digest) => {
    if (!canPresentStrict(get().entries[digest])) return false
    get().set(digest, "claimed")
    return true
  },
}))

/** Whether a prepared transaction may go to the wallet: never asked, or declined with 4001. */
export const canPresentStrict = (state: StrictSendState | undefined) =>
  state === undefined || state === "rejected"

export const strictEvmDigest = (prepared: PreparedEvmTransaction): string =>
  keccak256(
    stringToHex(
      JSON.stringify([
        prepared.chainId,
        String(prepared.from).toLowerCase(),
        String(prepared.to).toLowerCase(),
        String(prepared.data).toLowerCase(),
        String(prepared.value).toLowerCase(),
      ]),
    ),
  )

const H160_RE = /^0x[0-9a-fA-F]{40}$/
const DATA_RE = /^0x([0-9a-fA-F]{2})*$/
const QUANTITY_RE = /^0x[0-9a-fA-F]+$/

const isPrepared = (p: PreparedEvmTransaction | null | undefined) =>
  !!p &&
  Number.isSafeInteger(p.chainId) &&
  p.chainId > 0 &&
  H160_RE.test(p.from) &&
  H160_RE.test(p.to) &&
  DATA_RE.test(p.data) &&
  QUANTITY_RE.test(p.value)

/** The `tx` a strict transaction carries: the prepared call, for the review only. */
export const strictEvmCall = (
  prepared: PreparedEvmTransaction,
): ExtendedEvmCall => ({
  type: CallType.Evm,
  from: prepared.from,
  to: prepared.to as `0x${string}`,
  data: prepared.data,
  value: BigInt(prepared.value),
  dryRun: async () => undefined,
})

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export type StrictEvmRefusal =
  | "invalid"
  | "signer"
  | "edited"
  | "wrapped"
  | "sender"
  | "sequence"
  | "expired"

/** Why a strict transaction must not reach the wallet, or null. Read before the wallet is asked. */
export const getStrictEvmRefusal = (
  transaction: SingleTransaction,
  signer: unknown,
  now: number,
): StrictEvmRefusal | null => {
  const strict = transaction.strictEvm
  if (!strict || !isPrepared(strict.prepared)) return "invalid"
  if (!H160_RE.test(strict.sessionAddress)) return "invalid"
  const { prepared, after } = strict
  if (!isEthereumSigner(signer)) return "signer"
  // null only once useWrapTransaction saw an account that needs no wrapping
  if (strict.wrapRefusal !== null) return "wrapped"
  const { tx } = transaction
  if (
    !isEvmCall(tx) ||
    !same(tx.from, prepared.from) ||
    !same(tx.to, prepared.to) ||
    !same(tx.data, prepared.data) ||
    (tx.value ?? 0n) !== BigInt(prepared.value)
  )
    return "edited"
  if (
    !same(prepared.from, strict.sessionAddress) ||
    !same(signer.address, prepared.from)
  )
    return "sender"
  if (after !== undefined && after !== null) {
    if (!isPrepared(after)) return "invalid"
    const state = useStrictEvmLedger.getState().entries[strictEvmDigest(after)]
    if (state !== "succeeded") return "sequence"
  }
  if (strict.notAfter !== undefined && now >= strict.notAfter) return "expired"
  return null
}

/** What the account would need to send a strict transaction directly, or null. */
export const getStrictWrapRefusal = (args: {
  isMultisig: boolean
  isLoadingBinding: boolean
  isBound: boolean | undefined
}): StrictEvmWrapRefusal | null => {
  if (args.isMultisig) return "multisig"
  if (args.isLoadingBinding) return "pending"
  if (args.isBound === false) return "unbound"
  return null
}

const stateOf = (outcome: PreparedSendOutcome): StrictSendState | null => {
  switch (outcome.kind) {
    case "refused":
      return "refused"
    case "rejected":
      return "rejected"
    case "failed":
      return "failed"
    // a sent outcome's state was set by onSubmitted/onReceipt as it happened
    case "sent":
      return null
  }
}

/**
 * The strict route. Never throws: every outcome reaches `txOptions` as the
 * plain route's do, after the ledger records it.
 */
export const signAndSubmitStrictEvmTx = async (
  transaction: SingleTransaction,
  signer: unknown,
  txOptions: TxOptions,
): Promise<void> => {
  const strict = transaction.strictEvm
  if (!strict || !isPrepared(strict.prepared)) {
    txOptions.onError(STRICT_REFUSED)
    return
  }
  const digest = strictEvmDigest(strict.prepared)
  const ledger = useStrictEvmLedger.getState()
  if (!ledger.claim(digest)) {
    txOptions.onError(STRICT_REFUSED)
    return
  }
  const refusal = getStrictEvmRefusal(transaction, signer, Date.now())
  if (refusal || !isEthereumSigner(signer)) {
    ledger.set(digest, "refused")
    txOptions.onError(STRICT_REFUSED)
    return
  }

  // An error is passed on only once the ledger holds the outcome it belongs to.
  let settled = false
  const held: string[] = []
  const onError = (message: string) => {
    if (settled) txOptions.onError(message)
    else held.push(message)
  }

  let outcome: PreparedSendOutcome | null = null
  try {
    outcome = await signer.sendPreparedTransaction(strict.prepared, {
      priorityRpcUrl: txOptions.priorityRpcUrl,
      onPrompt: () => ledger.set(digest, "prompted"),
      onSubmitted: (txHash) => {
        ledger.set(digest, "sent")
        strict.onHash?.(txHash)
        txOptions.onSubmitted(txHash)
      },
      onReceipt: (status) =>
        ledger.set(
          digest,
          status === "success"
            ? "succeeded"
            : status === "reverted"
              ? "reverted"
              : "unknown",
        ),
      onSuccess: txOptions.onSuccess,
      onError,
      onFinalized: txOptions.onFinalized,
    })
  } catch {
    // not expected (the signer never throws): whatever the ledger last saw decides
    const state = useStrictEvmLedger.getState().entries[digest]
    if (state === "claimed") ledger.set(digest, "refused")
    else if (state === "prompted") ledger.set(digest, "failed")
    if (held.length === 0) held.push(STRICT_FAILED)
  }
  const next = outcome ? stateOf(outcome) : null
  if (next) ledger.set(digest, next)
  settled = true
  held.forEach((message) => txOptions.onError(message))
}

export type StrictStatusView = "declined" | "notSent" | "checking"

/**
 * The review's failure copy, from the ledger alone: declined (4001, no hash:
 * may be presented again), not sent (refused before the wallet was asked: not
 * presented again), or checking (anything else, the wallet may have sent).
 */
export const getStrictStatusView = (
  state: StrictSendState | undefined,
): StrictStatusView => {
  if (state === "rejected") return "declined"
  if (state === "refused") return "notSent"
  return "checking"
}
