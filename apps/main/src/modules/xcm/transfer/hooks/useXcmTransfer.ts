import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import {
  formatAddress,
  formatDestAddress,
  useCrossChainWallet,
  xcmTransferQuery,
} from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

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
      srcAddress:
        account && srcChain ? formatAddress(account.address, srcChain) : "",
      srcAsset: isValidAsset ? srcAsset.key : "",
      srcChain: srcChain?.key ?? "",
      destAddress: destChain ? formatDestAddress(destAddress, destChain) : "",
      destAsset: isValidAsset ? destAsset.key : "",
      destChain: destChain?.key ?? "",
    }),
  )
}
