import {
  TxActionType,
  TxState,
  TxStateAction,
  TxStatus,
} from "@/modules/transactions/types"
import { NATIVE_ASSET_ID } from "@/utils/consts"

export const INITIAL_STATUS: TxState = {
  open: true,
  status: "idle",
  error: null,
  isSigning: false,
  tip: "0",
  tipAssetId: NATIVE_ASSET_ID,
  mortalityPeriod: 512,
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
    case TxActionType.SET_TIP:
      return {
        ...state,
        tip: action.payload,
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
export const doSetTip = (payload: string) =>
  ({
    type: TxActionType.SET_TIP,
    payload,
  }) as const
