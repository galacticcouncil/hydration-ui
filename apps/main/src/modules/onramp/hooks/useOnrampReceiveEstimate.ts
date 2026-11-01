import { useQuery } from "@tanstack/react-query"
import { useFormContext } from "react-hook-form"

import { xcmDestinationFeeQuery } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  isOmniRoute,
  isSnowbridgeRoute,
} from "@/modules/xcm/transfer/utils/bridge"
import { calculateTransferDestAmount } from "@/modules/xcm/transfer/utils/transfer"

export const useOnrampReceiveEstimate = () => {
  const { selectedRoute, isLoading, transfer, transferArgs } = useXcmProvider()
  const { watch } = useFormContext<XcmFormValues>()
  const [srcChain, srcAsset, destChain, srcAmount] = watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "srcAmount",
  ])
  const isAmountBoundFee =
    isSnowbridgeRoute(selectedRoute) ||
    (isOmniRoute(selectedRoute) && !!destChain?.isZec())
  const destinationFee = useQuery(
    xcmDestinationFeeQuery(
      isAmountBoundFee ? transfer : null,
      srcAmount,
      transferArgs,
    ),
  )

  const isAvailable =
    !isAmountBoundFee ||
    (!destinationFee.isError &&
      !destinationFee.isPlaceholderData &&
      !!destinationFee.data)

  // Snowbridge's Ethereum gateway charges its bridge fee on top of the
  // transfer amount, including when both are paid in ETH.
  const isFeePaidOnSource =
    !!selectedRoute?.destination.fee.prepaid ||
    (isSnowbridgeRoute(selectedRoute) && !!srcChain?.isEvmChain())

  return {
    isLoading:
      isLoading ||
      (isAmountBoundFee &&
        !destinationFee.isError &&
        (destinationFee.isPending || destinationFee.isPlaceholderData)),
    isAvailable,
    amount:
      isAvailable && srcAsset && transfer
        ? calculateTransferDestAmount(
            srcAsset,
            srcAmount,
            transfer,
            isFeePaidOnSource,
            isAmountBoundFee ? destinationFee.data : undefined,
          )
        : "",
  }
}
