import {
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { DepositConnectedAssets } from "@/modules/onramp/deposit/steps/DepositConnectedAssets"
import { DepositOnchainAsset } from "@/modules/onramp/deposit/steps/DepositOnchainAsset"
import { DepositOnchainForm } from "@/modules/onramp/deposit/steps/DepositOnchainForm"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import {
  getWalletModeByChain,
  getXcmFormDefaults,
} from "@/modules/xcm/transfer/utils/chain"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DepositOnchainSteps = () => {
  const { t } = useTranslation("onramp")
  const { papi } = useRpcProvider()
  const page = useOnrampStore((state) => state.page)
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const walletFirstFlow = useOnrampModal((state) => state.walletFirstFlow)
  const setWalletContentWidth = useOnrampModal(
    (state) => state.setWalletContentWidth,
  )
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const { getValues, setValue } = useFormContext<XcmFormValues>()

  if (page === OnrampScreen.DepositOnchainWallet) {
    const sourceChain = getValues("srcChain")
    const sourceAsset = getValues("srcAsset")
    const resumingAsset =
      walletFirstFlow === "connected" && sourceChain && sourceAsset
    return (
      <Web3ConnectPage
        layout="split"
        keepSplitOpen={walletFirstFlow === "connected"}
        walletListVariant={
          walletFirstFlow === "connected" ? "connectedFirst" : "default"
        }
        onContentWidthChange={setWalletContentWidth}
        neckwork={neckworkClient}
        papi={papi}
        mode={
          resumingAsset ? getWalletModeByChain(sourceChain) : WalletMode.Default
        }
        accountFilter={
          resumingAsset
            ? (account) => canUseDepositAccount(account, sourceChain)
            : undefined
        }
        meta={{
          title: t(
            resumingAsset
              ? "deposit.connected.changeWallet"
              : "deposit.onchain.wallet.title",
          ),
          closable: true,
          hideAccountFilters: true,
        }}
        onBack={() => {
          if (resumingAsset) {
            paginateTo(OnrampScreen.DepositOnchainAsset)
            return
          }
          paginateTo(OnrampScreen.MethodSelect)
          useOnrampModal.getState().setModal("deposit")
        }}
        onAccountSelect={(account) => {
          setAccount(account)
          const defaults = getXcmFormDefaults(account)
          if (!getValues("destAddress")) {
            setValue("destAddress", defaults.destAddress)
            setValue("destAccount", defaults.destAccount)
          }
          if (resumingAsset && canUseDepositAccount(account, sourceChain)) {
            setValue("srcAmount", "")
            setValue("destAmount", "")
            paginateTo(OnrampScreen.DepositOnchainForm)
            return
          }
          useOnrampModal.getState().setWalletFirstAsset(null)
          setValue("srcChain", null)
          setValue("srcAsset", null)
          setValue("srcAmount", "")
          setValue("destAmount", "")
          paginateTo(OnrampScreen.DepositOnchainAsset)
        }}
      />
    )
  }

  if (page === OnrampScreen.DepositOnchainAsset)
    return walletFirstFlow === "connected" ? (
      <DepositConnectedAssets />
    ) : (
      <DepositOnchainAsset />
    )
  return <DepositOnchainForm />
}
