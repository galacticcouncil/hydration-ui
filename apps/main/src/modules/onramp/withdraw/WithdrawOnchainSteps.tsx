import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { FC, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawOnchainAsset } from "@/modules/onramp/withdraw/steps/WithdrawOnchainAsset"
import { WithdrawOnchainForm } from "@/modules/onramp/withdraw/steps/WithdrawOnchainForm"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

import { canUseWithdrawAccount } from "./WithdrawOnchain.utils"

type WithdrawOnchainStepsProps = { selectedAssetId?: string | null }

export const WithdrawOnchainSteps: FC<WithdrawOnchainStepsProps> = ({
  selectedAssetId,
}) => {
  const { t } = useTranslation("onramp")
  const { papi } = useRpcProvider()
  const page = useOnrampModal((state) => state.withdrawPage)
  const paginateTo = useOnrampModal((state) => state.paginateWithdraw)
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const { watch, setValue } = useFormContext<XcmFormValues>()
  const selectedAsset = watch("srcAsset")
  const resetAmounts = useResetAmounts()
  const { sourceChainAssetPairs } = useXcmProvider()
  const hasRoute =
    !!selectedAsset &&
    !!sourceChainAssetPairs
      .find(({ chain }) => chain.key === HYDRATION_CHAIN_KEY)
      ?.assets.some((asset) => asset.key === selectedAsset.key)

  useEffect(() => {
    if (page === OnrampScreen.WithdrawOnchainForm && !hasRoute)
      paginateTo(OnrampScreen.WithdrawOnchainAsset)
  }, [page, hasRoute, paginateTo])

  if (page === OnrampScreen.WithdrawOnchainWallet)
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
            hasRoute
              ? OnrampScreen.WithdrawOnchainForm
              : OnrampScreen.WithdrawOnchainAsset,
          )
        }
        onAccountSelect={(account) => {
          if (!canUseWithdrawAccount(account)) return
          setAccount(account)
          void resetAmounts()
          setValue("srcChain", chainsMap.get(HYDRATION_CHAIN_KEY) ?? null)
          paginateTo(
            hasRoute
              ? OnrampScreen.WithdrawOnchainForm
              : OnrampScreen.WithdrawOnchainAsset,
          )
        }}
      />
    )

  if (page === OnrampScreen.WithdrawOnchainAsset || !hasRoute)
    return (
      <WithdrawOnchainAsset
        unsupportedSelection={!!selectedAssetId && !hasRoute}
      />
    )
  return <WithdrawOnchainForm />
}
