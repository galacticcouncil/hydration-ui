import {
  PROVIDERS_BY_WALLET_MODE,
  useWeb3Connect,
} from "@galacticcouncil/web3-connect"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"

export const useChainSwitch = () => {
  const { account } = useWeb3Connect()
  const form = useFormContext<XcmFormValues>()
  return useCallback(() => {
    const { destChain, destAsset, srcChain, srcAsset } = form.getValues()

    const destWalletMode = destChain ? getWalletModeByChain(destChain) : null
    const isAccountValidForDest =
      destWalletMode &&
      account?.provider &&
      PROVIDERS_BY_WALLET_MODE[destWalletMode].includes(account.provider)

    form.reset({
      srcChain: destChain,
      srcAsset: destAsset,
      destChain: srcChain,
      destAsset: srcAsset,
      srcAmount: "",
      destAmount: "",
      destAddress: isAccountValidForDest ? account?.rawAddress : "",
      destAccount: isAccountValidForDest ? account : null,
    })
  }, [account, form])
}
