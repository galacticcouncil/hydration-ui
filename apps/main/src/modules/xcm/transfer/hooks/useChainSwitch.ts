import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

export const useChainSwitch = () => {
  const { account, setAccount } = useWeb3Connect()
  const form = useFormContext<XcmFormValues>()
  return useCallback(() => {
    const { destAccount, destChain, destAsset, srcChain, srcAsset } =
      form.getValues()

    if (destAccount && account) {
      setAccount(destAccount)
    }

    form.reset({
      srcChain: destChain,
      srcAsset: destAsset,
      destChain: srcChain,
      destAsset: srcAsset,
      srcAmount: "",
      destAmount: "",
      destAddress: destAccount?.rawAddress ?? account?.rawAddress ?? "",
      destAccount: destAccount && account ? account : destAccount,
    })
  }, [account, form, setAccount])
}
