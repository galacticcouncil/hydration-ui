import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { AssetConfig, OnrampScreen } from "@/modules/onramp/types"

export const useWithdraw = () => {
  const state = useOnrampStore()

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
    ...state,
    reset,
    setAsset,
    setTransfer,
    setSuccess,
  }
}
