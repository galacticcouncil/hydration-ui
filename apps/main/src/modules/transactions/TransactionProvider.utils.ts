import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { Binary } from "polkadot-api"

import {
  TxActionType,
  TxState,
  TxStateAction,
  TxStatus,
} from "@/modules/transactions/types"
import { Papi } from "@/providers/rpcProvider"

export const INITIAL_STATUS: TxState = {
  open: true,
  status: "idle",
  error: null,
  isSigning: false,
}

export const transactionStatusReducer = (
  state: TxState,
  action: TxStateAction,
): TxState => {
  switch (action.type) {
    case TxActionType.CLOSE:
      return {
        ...state,
        open: false,
      }
    case TxActionType.SIGN:
      return {
        ...state,
        isSigning: true,
      }
    case TxActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        status: "error",
      }
    case TxActionType.SET_STATUS:
      return {
        ...state,
        status: action.payload,
        open: action.payload === "submitted" ? false : state.open,
      }
    case TxActionType.RESET:
      return INITIAL_STATUS
    default:
      return state
  }
}

export const doClose = () => ({ type: TxActionType.CLOSE }) as const
export const doReset = () => ({ type: TxActionType.RESET }) as const
export const doSign = () => ({ type: TxActionType.SIGN }) as const
export const doSetError = (payload: string) =>
  ({
    type: TxActionType.SET_ERROR,
    payload,
  }) as const
export const doSetStatus = (payload: TxStatus) =>
  ({
    type: TxActionType.SET_STATUS,
    payload,
  }) as const

export const transformEvmCallToPapiTx = (papi: Papi, tx: ExtendedEvmCall) =>
  papi.tx.EVM.call({
    source: Binary.fromHex(tx.from),
    target: Binary.fromHex(tx.to),
    input: Binary.fromHex(tx.data),
    value: [0n, 0n, 0n, 0n],
    gas_limit: tx.gasLimit || 0n,
    max_fee_per_gas: [tx.maxFeePerGas || 0n, 0n, 0n, 0n],
    max_priority_fee_per_gas: [tx.maxPriorityFeePerGas || 0n, 0n, 0n, 0n],
    access_list: [],
    nonce: undefined,
  })
