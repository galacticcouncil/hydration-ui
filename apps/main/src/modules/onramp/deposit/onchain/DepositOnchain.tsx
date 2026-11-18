import {
  formatDestChainAddress,
  HYDRATION_CHAIN_KEY,
} from "@galacticcouncil/utils"
import {
  Account,
  AccountOverrideProvider,
  toAccount,
  useWeb3Connect,
} from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useLayoutEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

import { DepositBalanceRow } from "@/modules/onramp/deposit/onchain/DepositDiscovery.utils"
import { canUseDepositAccount } from "@/modules/onramp/deposit/onchain/DepositOnchain.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/onchain/hooks/useDepositAccounts"
import { DepositOnchainForm } from "@/modules/onramp/deposit/onchain/steps/DepositOnchainForm"
import { DepositOnchainHoldings } from "@/modules/onramp/deposit/onchain/steps/DepositOnchainHoldings"
import { DepositOnchainSubmitted } from "@/modules/onramp/deposit/onchain/steps/DepositOnchainSubmitted"
import { useOnrampModalStore } from "@/modules/onramp/store/useOnrampModalStore"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

export type DepositOnchainProps = {
  page: OnrampScreen
  onBack: () => void
}

export const DepositOnchain: React.FC<DepositOnchainProps> = ({
  page,
  onBack,
}) => {
  const activeAccount = useWeb3Connect((state) => state.account)
  const [sourceWallet, setSourceWallet] = useState<Account | null>(null)

  const destChain = chainsMap.get(HYDRATION_CHAIN_KEY) ?? null
  const destAddress =
    activeAccount && destChain
      ? formatDestChainAddress(activeAccount.rawAddress, destChain)
      : ""
  const destAccount =
    activeAccount && destAddress ? toAccount(activeAccount) : null

  return (
    <AccountOverrideProvider value={sourceWallet}>
      <XcmProvider
        destinationChainKey={HYDRATION_CHAIN_KEY}
        formOptions={{
          syncWithQueryParams: false,
          defaultValues: { destChain, destAddress, destAccount },
        }}
      >
        <DepositOnchainSteps
          page={page}
          onBack={onBack}
          onSourceWalletChange={setSourceWallet}
        />
      </XcmProvider>
    </AccountOverrideProvider>
  )
}

type DepositOnchainStepsProps = DepositOnchainProps & {
  onSourceWalletChange: (account: Account | null) => void
}

const DepositOnchainSteps: React.FC<DepositOnchainStepsProps> = ({
  page,
  onBack,
  onSourceWalletChange,
}) => {
  const { setValue } = useFormContext<XcmFormValues>()
  const resetAmounts = useResetAmounts()
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const [submitted, setSubmitted] = useState<{
    amount: string
    symbol: string
  } | null>(null)

  const selectSource = (
    account: Account,
    chain: XcmFormValues["srcChain"],
    asset: XcmFormValues["srcAsset"],
  ) => {
    onSourceWalletChange(account)
    setValue("srcChain", chain)
    setValue("srcAsset", asset)
    void resetAmounts()
    paginateTo(OnrampScreen.DepositOnchainForm)
  }

  const selectHolding = ({ source, balance }: DepositBalanceRow) =>
    selectSource(
      source.account,
      source.chain,
      source.assets.find((asset) => asset.key === balance.key) ?? balance,
    )

  // Portfolio preset: active account first, else any connected signer on that chain.
  // Unsupported route or no signer leaves the user on Holdings.
  const activeAccount = useWeb3Connect((state) => state.account)
  const depositAccounts = useDepositAccounts()
  const { sourceChainAssetPairs } = useXcmProvider()
  useLayoutEffect(() => {
    const { depositPreset, clearDepositPreset } = useOnrampModalStore.getState()
    if (!depositPreset) return
    clearDepositPreset()

    const pair = sourceChainAssetPairs.find(
      ({ chain }) => chain.key === depositPreset.chainKey,
    )
    const asset = pair?.assets.find(({ key }) => key === depositPreset.assetKey)
    if (!pair || !asset) return

    const usable = depositAccounts.filter((account) =>
      canUseDepositAccount(account, pair.chain),
    )
    const account =
      usable.find(
        ({ address, provider }) =>
          address === activeAccount?.address &&
          provider === activeAccount?.provider,
      ) ?? usable[0]
    if (account) selectSource(account, pair.chain, asset)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount
  }, [])

  const showSubmitted = ({ srcAmount, srcAsset }: XcmFormValues) => {
    setSubmitted({ amount: srcAmount, symbol: srcAsset?.originSymbol ?? "" })
    paginateTo(OnrampScreen.DepositOnchainSubmitted)
  }

  const depositAnother = () => {
    onSourceWalletChange(null)
    setValue("srcChain", null)
    setValue("srcAsset", null)
    void resetAmounts()
    setSubmitted(null)
    paginateTo(OnrampScreen.DepositOnchainHoldings)
  }

  return (
    <>
      {page === OnrampScreen.DepositOnchainHoldings && (
        <DepositOnchainHoldings onBack={onBack} onSelect={selectHolding} />
      )}
      {page === OnrampScreen.DepositOnchainForm && (
        <DepositOnchainForm
          onBack={() => paginateTo(OnrampScreen.DepositOnchainHoldings)}
          onSubmitted={showSubmitted}
        />
      )}
      {page === OnrampScreen.DepositOnchainSubmitted && submitted && (
        <DepositOnchainSubmitted
          amount={submitted.amount}
          symbol={submitted.symbol}
          onDepositAnother={depositAnother}
        />
      )}
    </>
  )
}
