import { useContext } from "react"

import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { AssetConfig, OnrampScreen } from "@/modules/onramp/types"
import { WithdrawCexContext } from "@/modules/onramp/withdraw/WithdrawCex.context"

export const useWithdraw = () => {
  const legacy = useOnrampStore()
  const modal = useContext(WithdrawCexContext)
  const state = modal ?? legacy

  const setAsset = (asset: AssetConfig) => {
    state.setAsset(asset)
    state.paginateTo(OnrampScreen.WithdrawTransfer)
  }

  const setTransfer = () => {
    state.paginateTo(OnrampScreen.WithdrawTransfer)
  }

  const setSuccess = () => {
    state.paginateTo(OnrampScreen.WithdrawSuccess)
  }

  const reset = () => {
    state.reset()
    state.paginateTo(OnrampScreen.MethodSelect)
  }

  return {
    page: state.page,
    asset: state.asset,
    cexId: state.cexId,
    amount: state.amount,
    setCexId: state.setCexId,
    setAmount: state.setAmount,
    paginateTo: state.paginateTo,
    reset,
    setAsset,
    setTransfer,
    setSuccess,
  }
}
