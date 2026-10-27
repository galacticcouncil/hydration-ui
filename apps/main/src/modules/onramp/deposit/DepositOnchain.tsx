import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"

import { DepositOnchainSteps } from "@/modules/onramp/deposit/DepositOnchainSteps"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

export const DepositOnchain = () => {
  const { account } = useAccount()
  const defaults = getXcmFormDefaults(account)
  const selection = useOnrampModal((state) => state.walletFirstAsset)
  const sourceChain = selection ? chainsMap.get(selection.chainKey) : null
  const sourceAsset = selection
    ? sourceChain?.assetsData.get(selection.assetKey)?.asset
    : null
  return (
    <XcmProvider
      destinationChainKey={HYDRATION_CHAIN_KEY}
      automaticBridgeSelection
      formOptions={{
        syncWithQueryParams: false,
        defaultValues: {
          ...defaults,
          srcChain: sourceAsset ? (sourceChain ?? null) : null,
          srcAsset: sourceAsset ?? null,
          destAsset: null,
          destChain: chainsMap.get(HYDRATION_CHAIN_KEY) ?? null,
        },
      }}
    >
      <DepositOnchainSteps />
    </XcmProvider>
  )
}
