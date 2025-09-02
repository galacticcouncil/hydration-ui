import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { useCrossChainWallet, xcmTransferQuery } from "@/api/xcm"
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

  const assetsMatch =
    !!srcAsset && !!destAsset && srcAsset.key === destAsset.key

  return useQuery(
    xcmTransferQuery(wallet, {
      srcAddress: account?.address ?? "",
      asset: assetsMatch ? srcAsset.key : "",
      srcChain: srcChain?.key ?? "",
      destAddress,
      destChain: destChain?.key ?? "",
    }),
  )
}
