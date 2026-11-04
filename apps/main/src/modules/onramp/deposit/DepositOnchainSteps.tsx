import { WalletMode, Web3ConnectPage } from "@galacticcouncil/web3-connect"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { DepositConnectWalletEmptyState } from "@/modules/onramp/deposit/components/DepositWalletEmptyState"
import { DepositConnectedAssets } from "@/modules/onramp/deposit/steps/DepositConnectedAssets"
import { DepositOnchainAsset } from "@/modules/onramp/deposit/steps/DepositOnchainAsset"
import { DepositOnchainForm } from "@/modules/onramp/deposit/steps/DepositOnchainForm"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DepositOnchainSteps = () => {
  const { t } = useTranslation("onramp")
  const { papi } = useRpcProvider()
  const page = useOnrampStore((state) => state.page)
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const assetsLayout = useOnrampModal((state) => state.depositAssetsLayout)
  const walletFirstFlow = useOnrampModal((state) => state.walletFirstFlow)
  const setWalletContentWidth = useOnrampModal(
    (state) => state.setWalletContentWidth,
  )
  const setSourceAccount = useOnrampModal(
    (state) => state.setDepositSourceAccount,
  )
  const { getValues, setValue } = useFormContext<XcmFormValues>()
  const sourceChain = getValues("srcChain")
  const sourceAsset = getValues("srcAsset")

  if (
    walletFirstFlow === "connected" &&
    assetsLayout === "split" &&
    (page === OnrampScreen.DepositOnchainWallet ||
      page === OnrampScreen.DepositOnchainAsset)
  )
    return <DepositConnectedAssets splitWallets />

  if (page === OnrampScreen.DepositOnchainWallet) {
    const resumingAsset =
      walletFirstFlow === "connected" && sourceChain && sourceAsset
    return (
      <Web3ConnectPage
        layout="split"
        keepSplitOpen
        onContentWidthChange={setWalletContentWidth}
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.Default}
        meta={{
          title: t(
            resumingAsset
              ? "deposit.connected.changeWallet"
              : "deposit.onchain.wallet.title",
          ),
          closable: true,
          hideAccountFilters: true,
          disconnectedWalletsContent: <DepositConnectWalletEmptyState />,
        }}
        onBack={() => {
          if (resumingAsset) {
            paginateTo(
              getValues("destAddress")
                ? OnrampScreen.DepositOnchainForm
                : OnrampScreen.DepositOnchainAsset,
            )
            return
          }
          paginateTo(OnrampScreen.MethodSelect)
          useOnrampModal.getState().setModal("deposit")
        }}
        onAccountSelect={(account) => {
          setSourceAccount(account)
          useOnrampModal.getState().setWalletFirstAsset(null)
          setValue("srcChain", null)
          setValue("srcAsset", null)
          setValue("bridgeProvider", null)
          setValue("destAsset", null)
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
