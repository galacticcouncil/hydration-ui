import { WalletMode, Web3ConnectPage } from "@galacticcouncil/web3-connect"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { DepositWalletEmptyState } from "@/modules/onramp/deposit/components/DepositWalletEmptyState"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { depositStepAfterSource } from "@/modules/onramp/deposit/DepositWalletFirstFlow.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useFundedDepositAccounts } from "@/modules/onramp/deposit/hooks/useFundedDepositAccounts"
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
  const accounts = useDepositAccounts({ signersOnly: true })
  const sourceChain = getValues("srcChain")
  const sourceAsset = getValues("srcAsset")
  const funded = useFundedDepositAccounts(accounts, sourceChain, sourceAsset)

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
        accountFilter={
          resumingAsset
            ? (account) =>
                canUseDepositAccount(account, sourceChain) &&
                funded.accounts.some(
                  (candidate) =>
                    candidate.provider === account.provider &&
                    candidate.address === account.address,
                )
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
          filteredAccountsEmpty: resumingAsset
            ? {
                title: t(
                  funded.isLoading
                    ? "deposit.quick.sourceLoading"
                    : "deposit.quick.sourceEmptyTitle",
                ),
                description: t(
                  funded.failed
                    ? "deposit.flow.assets.partial"
                    : "deposit.quick.sourceEmpty",
                  {
                    symbol: sourceAsset.originSymbol,
                    chain: sourceChain.name,
                  },
                ),
                loading: funded.isLoading,
                content: (
                  <DepositWalletEmptyState
                    symbol={sourceAsset.originSymbol}
                    chain={sourceChain.name}
                    failed={funded.failed}
                  />
                ),
              }
            : undefined,
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
          if (
            resumingAsset &&
            canUseDepositAccount(account, sourceChain) &&
            funded.accounts.some(
              (candidate) =>
                candidate.provider === account.provider &&
                candidate.address === account.address,
            )
          ) {
            setValue("srcAmount", "")
            setValue("destAmount", "")
            paginateTo(
              depositStepAfterSource(walletFirstFlow, getValues("destAddress")),
            )
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
