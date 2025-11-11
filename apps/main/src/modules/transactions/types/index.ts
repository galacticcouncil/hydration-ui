import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { tx } from "@galacticcouncil/sdk-next"
import { Call } from "@galacticcouncil/xcm-sdk"
import { InvalidTxError, PolkadotClient, TxEvent } from "polkadot-api"
import { Subscription } from "rxjs"
import { TransactionReceipt } from "viem"

export type AnyPapiTx = tx.Transaction
export type AnyTransaction = AnyPapiTx | Call | ExtendedEvmCall

export enum TxActionType {
  CLOSE = "CLOSE",
  SIGN = "SIGN",
  SET_ERROR = "SET_ERROR",
  SET_STATUS = "SET_STATUS",
  RESET = "RESET",
  SET_TIP = "SET_TIP",
  SET_FEE_PAYMENT_MODAL_OPEN = "SET_FEE_PAYMENT_MODAL_OPEN",
}

export type TxStatus = "idle" | "submitted" | "success" | "error"
export type TxMortalityPeriod = 32 | 64 | 128 | 256 | 512 | 1024

export type TxStatusCallbacks = {
  onSubmitted: (txHash: string) => void
  onSuccess: (event: TxBestBlocksStateResult | TransactionReceipt) => void
  onError: (error: string) => void
  onFinalized: (event: TxFinalizedResult | TransactionReceipt) => void
}

export type TxOptions = TxStatusCallbacks & {
  nonce?: number
  tip?: bigint
  mortalityPeriod: TxMortalityPeriod
  chainKey: string
  feeAssetId: string
}

export type TxEventOrError =
  | TxEvent
  | { type: "error"; error: Error | InvalidTxError }

export type TxBestBlocksStateResult = Extract<
  TxEvent,
  { type: "txBestBlocksState"; found: true; ok: true }
>

export type TxFinalizedResult = Extract<
  TxEvent,
  { type: "finalized"; found: true; ok: true }
>

export type TxResult = Subscription | TransactionReceipt | void

export type TxSignAndSubmitFn<T = unknown, S = unknown> = (
  tx: T,
  signer: S,
  options: TxOptions,
) => Promise<TxResult>

export type UnsignedTxSubmitFn<T = unknown> = (
  tx: T,
  client: PolkadotClient,
  options: TxOptions,
) => Promise<Subscription>

export type TxState = {
  open: boolean
  status: TxStatus
  error: string | null
  isSigning: boolean
  tip: string
  tipAssetId: string
  mortalityPeriod: TxMortalityPeriod
  isFeePaymentModalOpen: boolean
}

export type TxStateAction =
  | { type: TxActionType.CLOSE }
  | { type: TxActionType.SIGN }
  | { type: TxActionType.SET_ERROR; payload: string }
  | { type: TxActionType.SET_STATUS; payload: TxStatus }
  | { type: TxActionType.SET_TIP; payload: string }
  | { type: TxActionType.SET_FEE_PAYMENT_MODAL_OPEN; payload: boolean }
  | { type: TxActionType.RESET }
