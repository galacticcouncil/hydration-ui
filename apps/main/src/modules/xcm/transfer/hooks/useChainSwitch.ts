import { useAccount } from "@galacticcouncil/web3-connect"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { isAccountValidOnChain } from "@/modules/xcm/transfer/utils/chain"

export const useChainSwitch = () => {
  const { account } = useAccount()
  const form = useFormContext<XcmFormValues>()
  return useCallback(async () => {
    const { srcChain, srcAsset, destChain, destAsset } = form.getValues()

    const newSrcChain = destChain
    const newSrcAsset = destAsset

    const newDestChain = srcChain
    const newDestAsset = srcAsset

    const isAccountValidForDest =
      !!newDestChain && isAccountValidOnChain(account, newDestChain)

    form.reset({
      srcChain: newSrcChain,
      srcAsset: newSrcAsset,
      destChain: newDestChain,
      destAsset: newDestAsset,
      srcAmount: "",
      destAmount: "",
      destAddress: isAccountValidForDest ? (account?.rawAddress ?? "") : "",
      destAccount: isAccountValidForDest ? account : null,
    })

    await form.trigger()
    form.clearErrors()
  }, [account, form])
}
