import {
  ZEC_DECIMALS,
  type ZecCall,
  type ZecTxObserver,
  type ZecWallet,
} from "@galacticcouncil/xc-sdk"
import {
  type Balance,
  type FundingSource,
  getNoirWallet,
  type ZcashAPI,
} from "@noir-wallet/sdk"

// Relative: the app's tests load this file, and read "@/" as the app's src
import { getWalletErrorMessage } from "./errors"

const ZEC_TX_FAILED = "Zcash payment failed"
const ZEC_TX_NO_ID = "The wallet returned no transaction id"
const NOIR_BALANCE_UNAVAILABLE = "Noir balance unavailable"

/** A broadcast payment: its id is all a Zcash wallet hands back. */
export type ZecTxStatus = { txId: string }

export type ZecTxCallbacks = {
  onSubmitted: (txId: string) => void
  onSuccess: (status: ZecTxStatus) => void
  onError: (error: string) => void
  onFinalized: (status: ZecTxStatus) => void
}

/** The Noir calls a payment and a balance read go through. */
type NoirZcash = Pick<
  ZcashAPI,
  "getAccounts" | "getBalance" | "sendTransaction"
>

/**
 * Reports a Zcash payment through the transaction callbacks.
 *
 * - The sdk signer never rejects: a rejection arrives as `onError`
 * - Nothing follows the payment on chain here, so the broadcast id is the
 *   success; the deposit is tracked on the far side
 */
export const reportZecSend = async (
  send: (observer: ZecTxObserver) => Promise<void>,
  { onSubmitted, onSuccess, onError, onFinalized }: ZecTxCallbacks,
): Promise<ZecTxStatus> => {
  const result: { txId?: string; failure?: { error: unknown } } = {}

  await send({
    onTransactionSend: (txId) => {
      result.txId = txId
      onSubmitted(txId)
    },
    onError: (error) => {
      result.failure = { error }
    },
  })

  const { txId, failure } = result

  if (!txId) {
    const message = failure
      ? getWalletErrorMessage(failure.error) || ZEC_TX_FAILED
      : ZEC_TX_NO_ID
    onError(message)
    throw failure?.error instanceof Error ? failure.error : new Error(message)
  }

  const status = { txId }
  onSuccess(status)
  onFinalized(status)
  return status
}

/** Zatoshi of a decimal ZEC string, without going through a float. */
export const toZatoshi = (zec: string): bigint => {
  const [whole, fraction = ""] = zec.trim().split(".")
  const unit = 10n ** BigInt(ZEC_DECIMALS)
  const zats = BigInt(fraction.padEnd(ZEC_DECIMALS, "0").slice(0, ZEC_DECIMALS))
  return BigInt(whole || "0") * unit + zats
}

/**
 * A Noir balance in zatoshi, by the pool a payment can be funded from.
 *
 * - Shielded is `available`, what Noir can select before fees, capped at the
 *   shielded balance in case it counts transparent funds too
 */
const getNoirSpendable = (balance: Balance) => {
  const shielded = toZatoshi(balance.shielded)
  const available = toZatoshi(balance.available || balance.shielded)
  return {
    shielded: available < shielded ? available : shielded,
    transparent: toZatoshi(balance.transparent),
  }
}

/**
 * The pool a Noir payment of `need` zatoshi is funded from: shielded whenever
 * it covers the payment, as Noir funds by default, else transparent.
 */
const getNoirFundingSource = (balance: Balance, need: bigint): FundingSource =>
  getNoirSpendable(balance).shielded >= need ? "shielded" : "transparent"

/**
 * Noir as the wallet paying a call, checked before Noir opens.
 *
 * - Noir pays from its active account, so that has to be the call's sender
 * - Funded from shielded ZEC when it covers the payment and its fee, else from
 *   transparent ZEC
 * - `fundingSource` is sent for transparent only, so a shielded payment is a
 *   request every Noir version knows
 *
 * @param fee - the payment's estimated fee, in zatoshi
 */
export const prepareNoirPayment = async (
  zcash: NoirZcash,
  { from, amount }: ZecCall,
  fee: bigint,
): Promise<ZecWallet> => {
  const connection = await zcash.getAccounts()
  const sender = connection?.accounts.find(
    ({ addresses }) => addresses.transparent === from,
  )
  const name = sender?.label || from

  // Noir reads none when locked, disconnected or on an unauthorized account
  if (!connection) {
    throw new Error(`Unlock Noir and switch it to ${name}, then try again`)
  }
  if (connection.transparent !== from) {
    throw new Error(
      `Noir pays from its active account: switch it to ${name}, then try again`,
    )
  }

  // With no account given, Noir reads the active account: the one that pays
  const balance = await zcash.getBalance()
  const fundingSource = getNoirFundingSource(balance, amount + fee)

  return {
    sendTransaction: (params) =>
      zcash.sendTransaction(
        fundingSource === "transparent" ? { ...params, fundingSource } : params,
      ),
  }
}

/**
 * Spendable balance of a Noir account, by its transparent address.
 *
 * - The larger of its shielded and transparent spendable, since a payment is
 *   funded from one pool
 * - An address Noir does not hold, or no Noir at all, reads as zero
 * - A cached figure (`synced: false`) is reported as is: the next poll brings
 *   the synced one, where a failed first read would drop the balance
 */
export const readNoirBalance = async (address: string): Promise<bigint> => {
  const noir = getNoirWallet()
  if (!noir) return 0n

  try {
    const connection = await noir.zcash.getAccounts()
    const account = connection?.accounts.find(
      ({ addresses }) => addresses.transparent === address,
    )
    if (!account) return 0n

    const balance = await noir.zcash.getBalance(account.id)
    const { shielded, transparent } = getNoirSpendable(balance)
    return shielded > transparent ? shielded : transparent
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error(getWalletErrorMessage(err) || NOIR_BALANCE_UNAVAILABLE)
  }
}
