import {
  EvmAddr,
  HYDRATION_CHAIN_KEY,
  safeConvertH160toSS58,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { AnyChain } from "@galacticcouncil/xcm-core"
import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { useCrossChainWallet, xcmTransferQuery } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

const formatDestAddress = (address: string, chain: AnyChain): string => {
  if (chain.key === HYDRATION_CHAIN_KEY && EvmAddr.isValid(address)) {
    return safeConvertH160toSS58(address)
  }
  return address
}

export const useXcmTransfer = (form: UseFormReturn<XcmFormValues>) => {
  const wallet = useCrossChainWallet()
  const { account } = useAccount()

  const [srcAsset, destAsset, srcChain, destChain, destAddress] = form.watch([
    "srcAsset",
    "destAsset",
    "srcChain",
    "destChain",
    "destAddress",
  ])

  const isValidPair = srcChain
    ? srcChain.assetsData
        .values()
        .map((a) => a.asset)
        .some((a) => a.key === srcAsset?.key)
    : false

  const isValidAsset = !!srcAsset && !!destAsset && isValidPair

  return useQuery(
    xcmTransferQuery(wallet, {
      srcAddress: account?.rawAddress ?? "",
      asset: isValidAsset ? srcAsset.key : "",
      srcChain: srcChain?.key ?? "",
      destAddress: destChain ? formatDestAddress(destAddress, destChain) : "",
      destChain: destChain?.key ?? "",
    }),
  )
}
