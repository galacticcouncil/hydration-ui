import { isAddressValidOnChain } from "@galacticcouncil/utils"
import type { AnyChain, Asset } from "@galacticcouncil/xc-core"

import type { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

type WithdrawFormRoute = {
  sourceChain: AnyChain
  sourceAsset: Asset
  destinationChain: AnyChain
  destinationAsset: Asset
}

export const getWithdrawSelectionFormValues = (
  previous: XcmFormValues,
  route: WithdrawFormRoute,
): XcmFormValues => ({
  ...previous,
  srcChain: route.sourceChain,
  srcAsset: route.sourceAsset,
  destChain: route.destinationChain,
  destAsset: route.destinationAsset,
  srcAmount: "",
  destAmount: "",
  bridgeProvider: null,
  ...(isAddressValidOnChain(previous.destAddress, route.destinationChain)
    ? {}
    : { destAddress: "", destAccount: null }),
})
