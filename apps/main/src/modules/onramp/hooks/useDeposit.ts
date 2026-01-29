import { useDepositStore } from "@/modules/onramp/store/useDepositStore"
import { AssetConfig, OnrampScreen } from "@/modules/onramp/types"

export const useDeposit = () => {
  const state = useDepositStore()

  const setAsset = (asset: AssetConfig) => {
    state.setAsset(asset)
    state.paginateTo(OnrampScreen.DepositAsset)
  }

  const setTransfer = () => {
    state.paginateTo(OnrampScreen.DepositTransfer)
  }

  const setSuccess = () => {
    state.paginateTo(OnrampScreen.DepositSuccess)
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
