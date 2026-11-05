import { ModalHeader } from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  useAccount,
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { FC, useEffect } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"
import { useWithdraw } from "@/modules/onramp/withdraw/hooks/useWithdraw"
import { WithdrawCexSelect } from "@/modules/onramp/withdraw/steps/WithdrawCexSelect"
import { WithdrawSuccess } from "@/modules/onramp/withdraw/steps/WithdrawSuccess"
import { WithdrawTransfer } from "@/modules/onramp/withdraw/steps/WithdrawTransfer"
import { WithdrawTransferOnchain } from "@/modules/onramp/withdraw/steps/WithdrawTransferOnchain"
import { useRpcProvider } from "@/providers/rpcProvider"

import { canUseWithdrawAccount } from "./WithdrawOnchain.utils"

export const WithdrawCexModalSteps: FC = () => {
  const { t } = useTranslation("onramp")
  const { papi } = useRpcProvider()
  const { account } = useAccount()
  const connected = useDepositAccounts()
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const { page, asset, setAsset, setSuccess, reset, paginateTo } = useWithdraw()
  const hasSource =
    canUseWithdrawAccount(account) &&
    connected.some(
      (source) =>
        source.address === account.address &&
        source.provider === account.provider,
    )
  const isTransfer = page === OnrampScreen.WithdrawTransfer
  const needsWallet =
    page === OnrampScreen.WithdrawOnchainWallet ||
    (isTransfer && !!asset && !hasSource)

  useEffect(() => {
    if (isTransfer && asset && !hasSource)
      paginateTo(OnrampScreen.WithdrawOnchainWallet)
    else if (isTransfer && !asset) paginateTo(OnrampScreen.WithdrawAssetSelect)
  }, [isTransfer, asset, hasSource, paginateTo])

  if (needsWallet)
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.SubstrateEVM}
        accountFilter={canUseWithdrawAccount}
        meta={{
          title: t("withdraw.onchain.wallet.title"),
          description: t("withdraw.onchain.wallet.description"),
          closable: true,
        }}
        onBack={() =>
          paginateTo(
            asset && hasSource
              ? OnrampScreen.WithdrawTransfer
              : OnrampScreen.WithdrawAssetSelect,
          )
        }
        onAccountSelect={(selected) => {
          if (!canUseWithdrawAccount(selected)) return
          setAccount(selected)
          paginateTo(
            asset
              ? OnrampScreen.WithdrawTransfer
              : OnrampScreen.WithdrawAssetSelect,
          )
        }}
      />
    )

  if (page === OnrampScreen.WithdrawSuccess)
    return (
      <>
        <ModalHeader title={t("withdraw.success.title")} align="center" />
        <WithdrawSuccess
          showTitle={false}
          onConfirm={() => {
            reset()
            paginateTo(OnrampScreen.WithdrawAssetSelect)
          }}
        />
      </>
    )

  if (isTransfer && asset && hasSource) {
    const props = {
      onTransferSuccess: setSuccess,
      onBack: () => paginateTo(OnrampScreen.WithdrawAssetSelect),
      onSourceAccountChange: () =>
        paginateTo(OnrampScreen.WithdrawOnchainWallet),
      closable: true,
    }
    return asset.withdrawalChain === HYDRATION_CHAIN_KEY ? (
      <WithdrawTransferOnchain {...props} />
    ) : (
      <WithdrawTransfer {...props} />
    )
  }

  return (
    <WithdrawCexSelect
      closable
      onAssetSelect={(asset) => {
        setAsset(asset)
        if (!hasSource) paginateTo(OnrampScreen.WithdrawOnchainWallet)
      }}
      onBack={() => useOnrampModal.getState().setModal("withdraw")}
    />
  )
}
