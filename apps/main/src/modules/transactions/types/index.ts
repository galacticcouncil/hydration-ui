import { InvalidTxError, PolkadotClient, TxEvent } from "polkadot-api"
import { Subscription } from "rxjs"
import { TransactionReceipt } from "viem"

import { Transaction } from "@/states/transactions"

export enum TxActionType {
  CLOSE = "CLOSE",
  SIGN = "SIGN",
  SET_ERROR = "SET_ERROR",
  SET_STATUS = "SET_STATUS",
  RESET = "RESET",
}

export type TxStatus = "idle" | "submitted" | "success" | "error"

export type TxStatusCallbacks = {
  onSubmitted: (txHash: string) => void
  onSuccess: () => void
  onError: (error: string) => void
  onFinalized: () => void
}

export type TxOptions = TxStatusCallbacks & {
  nonce?: number
  chainKey: string
  feeAssetId: string
}

export type TxEventOrError =
  | TxEvent
  | { type: "error"; error: Error | InvalidTxError }

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
}

export type TxStateAction =
  | { type: TxActionType.CLOSE }
  | { type: TxActionType.SIGN }
  | { type: TxActionType.SET_ERROR; payload: string }
  | { type: TxActionType.SET_STATUS; payload: TxStatus }
  | { type: TxActionType.RESET }

export interface TxContext extends Transaction, TxState {
  setStatus: (status: TxStatus) => void
  signAndSubmit: () => void
  reset: () => void
}
