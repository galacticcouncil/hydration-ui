import { usePrevious } from "react-use"

import { useDepositStore } from "@/modules/onramp/store/useDepositStore"
import {
  AssetConfig,
  DepositMethod,
  DepositScreen,
} from "@/modules/onramp/types"

const initialState = {
  page: DepositScreen.Select,
  asset: null,
  cexId: "kraken",
  method: null,
  amount: "",
  currentDeposit: null,
  pendingDeposits: [],
}

export const useDeposit = () => {
  const state = useDepositStore()

  const setAsset = (asset: AssetConfig) => {
    state.setAsset(asset)
    state.paginateTo(DepositScreen.DepositAsset)
  }

  const setMethod = (method: DepositMethod) => {
    state.setMethod(method)
    state.paginateTo(DepositScreen.Method)
  }

  const setTransfer = () => {
    state.paginateTo(DepositScreen.Transfer)
  }

  const setSuccess = () => {
    state.paginateTo(DepositScreen.Success)
  }

  const reset = () => {
    state.reset()
    state.paginateTo(DepositScreen.Select)
  }

  const previous = usePrevious(state.page)

  const direction = (previous ?? initialState.page) < state.page ? 1 : -1

  return {
    ...state,
    direction,
    reset,
    setAsset,
    setMethod,
    setTransfer,
    setSuccess,
  }
}
