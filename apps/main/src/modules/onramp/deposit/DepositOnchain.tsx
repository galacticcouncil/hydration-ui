import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  AccountOverrideProvider,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"

import { DepositOnchainSteps } from "@/modules/onramp/deposit/DepositOnchainSteps"
import { useDepositRecoveryStore } from "@/modules/onramp/deposit/store/useDepositRecoveryStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

export const DepositOnchain = () => {
  const { account } = useAccount()
  const defaults = getXcmFormDefaults(account)
  const recoveryId = useOnrampModal((state) => state.depositRecoveryId)
  const recovery = useDepositRecoveryStore((state) =>
    state.deposits.find((item) => item.id === recoveryId),
  )
  const selection = useOnrampModal((state) => state.walletFirstAsset)
  const walletFirstFlow = useOnrampModal((state) => state.walletFirstFlow)
  const sourceAccount = useOnrampModal((state) => state.depositSourceAccount)
  const sourceChain = selection ? chainsMap.get(selection.chainKey) : null
  const sourceAsset = selection
    ? sourceChain?.assetsData.get(selection.assetKey)?.asset
    : null
  return (
    <AccountOverrideProvider value={sourceAccount}>
      <XcmProvider
        destinationChainKey={HYDRATION_CHAIN_KEY}
        automaticBridgeSelection
        formOptions={{
          syncWithQueryParams: false,
          defaultValues: {
            ...defaults,
            ...(walletFirstFlow === "connected"
              ? { destAddress: "", destAccount: null }
              : {}),
            srcChain: sourceAsset ? (sourceChain ?? null) : null,
            srcAsset: sourceAsset ?? null,
            destAsset: null,
            destChain: chainsMap.get(HYDRATION_CHAIN_KEY) ?? null,
            ...(recovery
              ? {
                  srcAmount: recovery.amount,
                  destAddress: recovery.destinationAddress,
                  destAccount: recovery.destination,
                }
              : {}),
          },
        }}
      >
        <DepositOnchainSteps />
      </XcmProvider>
    </AccountOverrideProvider>
  )
}
