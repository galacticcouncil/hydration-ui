import { ApiPromise } from "@polkadot/api"
import { hydration } from "@polkadot-api/descriptors"
import { Binary, TypedApi } from "polkadot-api"
import { isString } from "remeda"

import {
  TxActionType,
  TxState,
  TxStateAction,
  TxStatus,
} from "@/modules/transactions/types"
import { isSubstrateCall } from "@/modules/transactions/utils/xcm"
import { AnyTransaction } from "@/states/transactions"

/**
 *
 * Transform a transaction from SubmittableExtrinsic to PapiTx
 *
 * @TODO: remove after migrating to sdk-next
 * */
export const transformPjsToPapiTx = async (
  api: ApiPromise,
  papi: TypedApi<typeof hydration>,
  tx: AnyTransaction | string,
) => {
  if (isString(tx) || isSubstrateCall(tx)) {
    const dataHex = isString(tx) ? tx : tx.data
    const submittableExtrinsic = api.tx(dataHex)
    const callData = Binary.fromHex(submittableExtrinsic.inner.toHex())
    return papi.txFromCallData(callData)
  }

  return tx
}

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
