import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { AccountOverrideProvider } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { FC } from "react"

import { DepositPreviewSteps } from "@/modules/onramp/deposit/preview/DepositPreviewSteps"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import {
  DepositVariant,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

export const DepositPreview: FC<{ variant?: DepositVariant }> = ({
  variant = "preview",
}) => {
  const { destinationAddress, destinationAccount, selection, amount } =
    useDepositJourneyStore()
  const directEntry = useOnrampModal((state) => state.depositEntryChoice)
  const source = selection ? chainsMap.get(selection.chainKey) : undefined
  const asset = source?.assetsData.get(selection?.assetKey ?? "")?.asset
  return (
    <AccountOverrideProvider
      value={
        variant === "simple" && directEntry
          ? (selection?.account ?? null)
          : undefined
      }
    >
      <XcmProvider
        destinationChainKey={HYDRATION_CHAIN_KEY}
        automaticBridgeSelection
        formOptions={{
          syncWithQueryParams: false,
          defaultValues: {
            srcChain: source ?? null,
            srcAsset: asset ?? null,
            destChain: chainsMap.get(HYDRATION_CHAIN_KEY) ?? null,
            destAsset: null,
            destAddress: destinationAddress,
            destAccount: destinationAccount,
            srcAmount: amount,
            destAmount: "",
          },
        }}
      >
        <DepositPreviewSteps variant={variant} />
      </XcmProvider>
    </AccountOverrideProvider>
  )
}
