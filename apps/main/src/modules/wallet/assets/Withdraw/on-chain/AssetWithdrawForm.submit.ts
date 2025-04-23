import { useCallback } from "react"

import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"

export const useWithdrawAsset = () => {
  return useCallback((form: AssetWithdrawFormValues) => {
    console.log(form)
  }, [])
}
