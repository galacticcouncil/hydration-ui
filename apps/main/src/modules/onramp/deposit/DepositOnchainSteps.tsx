import {
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { DepositOnchainAsset } from "@/modules/onramp/deposit/steps/DepositOnchainAsset"
import { DepositOnchainForm } from "@/modules/onramp/deposit/steps/DepositOnchainForm"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DepositOnchainSteps = () => {
  const { t } = useTranslation("onramp")
  const { papi } = useRpcProvider()
  const page = useOnrampStore((state) => state.page)
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const { getValues, setValue } = useFormContext<XcmFormValues>()

  if (page === OnrampScreen.DepositOnchainWallet) {
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.Default}
        meta={{
          title: t("deposit.onchain.wallet.title"),
          closable: true,
          hideAccountFilters: true,
        }}
        onBack={() => {
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
          setValue("srcChain", null)
          setValue("srcAsset", null)
          setValue("srcAmount", "")
          setValue("destAmount", "")
          paginateTo(OnrampScreen.DepositOnchainAsset)
        }}
      />
    )
  }

  if (page === OnrampScreen.DepositOnchainAsset) return <DepositOnchainAsset />
  return <DepositOnchainForm />
}
