import { Plus, Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Select,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
} from "@galacticcouncil/utils"
import {
  Account,
  AccountWalletAvatar,
  useWeb3Connect,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { withHydrationDepositSource } from "@/modules/onramp/deposit/DepositLocalSource.utils"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { DepositPreviewForm } from "@/modules/onramp/deposit/preview/steps/DepositPreviewForm"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { DepositGuidedDestination } from "@/modules/onramp/deposit/variants/DepositGuidedDestination"
import { DepositQuickAssetSelect } from "@/modules/onramp/deposit/variants/DepositQuickAssetSelect"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DepositQuickStart = () => {
  const { t } = useTranslation("onramp")
  const { papi } = useRpcProvider()
  const { sourceChainAssetPairs } = useXcmProvider()
  const { getValues, reset } = useFormContext<XcmFormValues>()
  const directEntry = useOnrampModal((state) => state.depositEntryChoice)
  const setWalletContentWidth = useOnrampModal(
    (state) => state.setWalletContentWidth,
  )
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const accounts = useDepositAccounts({ signersOnly: true })
  const intent = useDepositJourneyStore((state) => state.assetIntent)
  const selection = useDepositJourneyStore((state) => state.selection)
  const [chainKey, setChainKey] = useState(intent?.chainKey ?? "")
  const [assetKey, setAssetKey] = useState(intent?.assetKey ?? "")
  const [sourceKey, setSourceKey] = useState("")
  const [selectingAsset, setSelectingAsset] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const pairs = withHydrationDepositSource(sourceChainAssetPairs).filter(
    ({ assets }) => assets.length > 0,
  )
  const selectedPair = pairs.find(({ chain }) => chain.key === chainKey)
  const selectedAsset = selectedPair?.assets.find(
    (asset) => asset.key === assetKey,
  )
  const isSourcePickerOpen = connecting && !!selectedPair && !!selectedAsset
  useEffect(() => {
    if (!directEntry) return
    setWalletContentWidth(isSourcePickerOpen ? pxToRem(650) : null)
    return () => setWalletContentWidth(null)
  }, [directEntry, isSourcePickerOpen, setWalletContentWidth])
  const eligible = (account: Account) =>
    !!selectedPair &&
    !!selectedAsset &&
    canUseDepositAccount(account, selectedPair.chain)
  const compatible = accounts.filter(eligible)
  const sameRoute =
    selection?.chainKey === chainKey && selection?.assetKey === assetKey
  const selectedSource = compatible.find(
    (account) => `${account.provider}:${account.address}` === sourceKey,
  )

  const selectSource = useCallback(
    (account: Account) => {
      if (
        !selectedPair ||
        selectedPair.chain.key === HYDRATION_CHAIN_KEY ||
        !selectedAsset ||
        !canUseDepositAccount(account, selectedPair.chain)
      )
        return
      const journey = useDepositJourneyStore.getState()
      const values = getValues()
      const active = useWeb3Connect.getState().account
      if (
        active?.provider !== account.provider ||
        active.address !== account.address
      )
        setAccount(account)
      if (
        journey.selection?.chainKey === selectedPair.chain.key &&
        journey.selection.assetKey === selectedAsset.key &&
        journey.selection.account.provider === account.provider &&
        journey.selection.account.address === account.address &&
        values.srcChain?.key === selectedPair.chain.key &&
        values.srcAsset?.key === selectedAsset.key
      )
        return
      reset({
        ...values,
        srcChain: selectedPair.chain,
        srcAsset: selectedAsset,
        srcAmount: "",
        destAsset: null,
        destAmount: "",
        bridgeProvider: null,
        destAddress: journey.destinationAddress,
        destAccount: journey.destinationAccount,
      })
      journey.setAmount("")
      journey.setSelection(
        {
          account,
          chainKey: selectedPair.chain.key,
          assetKey: selectedAsset.key,
        },
        { stayOnSources: true },
      )
    },
    [selectedPair, selectedAsset, getValues, setAccount, reset],
  )

  useEffect(() => {
    if (selectedSource) selectSource(selectedSource)
  }, [selectedSource, selectSource])

  const choosePair = ({ asset, chain }: { asset: Asset; chain: AnyChain }) => {
    setSelectingAsset(false)
    if (asset.key === assetKey && chain.key === chainKey) return
    setAssetKey(asset.key)
    setChainKey(chain.key)
    setSourceKey("")
    reset({
      ...getValues(),
      srcChain: null,
      srcAsset: null,
      srcAmount: "",
      destAsset: null,
      destAmount: "",
      bridgeProvider: null,
    })
    useDepositJourneyStore
      .getState()
      .setAssetIntent({ assetKey: asset.key, chainKey: chain.key })
  }
  const back = () => {
    useDepositJourneyStore.getState().leave()
    useOnrampStore.getState().paginateTo(OnrampScreen.MethodSelect)
    useOnrampModal.getState().setModal("deposit")
  }

  if (selectingAsset)
    return (
      <DepositQuickAssetSelect
        selectedAsset={selectedAsset}
        selectedChain={selectedPair?.chain}
        onBack={() => setSelectingAsset(false)}
        items={pairs.flatMap(({ chain, assets }) =>
          assets.map((asset) => ({ asset, chain })),
        )}
        onSelect={choosePair}
      />
    )

  if (connecting && selectedPair && selectedAsset)
    return (
      <Web3ConnectPage
        layout={directEntry ? "split" : "page"}
        keepSplitOpen={directEntry}
        walletListVariant={directEntry ? "connectedFirst" : "default"}
        neckwork={neckworkClient}
        papi={papi}
        mode={getWalletModeByChain(selectedPair.chain)}
        accountFilter={eligible}
        meta={{
          title: t("deposit.variants.connectTitle", {
            symbol: selectedAsset.originSymbol,
          }),
          description: t("deposit.variants.connectDescription", {
            symbol: selectedAsset.originSymbol,
            chain: selectedPair.chain.name,
          }),
          closable: true,
          hideAccountFilters: true,
          hideExternalWallet: true,
          hideMultisig: true,
        }}
        onBack={() => setConnecting(false)}
        onAccountSelect={(account) => {
          if (!eligible(account)) return
          setSourceKey(`${account.provider}:${account.address}`)
          selectSource(account)
          setConnecting(false)
        }}
      />
    )

  const controls = (disabled = false, showAssetSelector = true) => (
    <Stack data-onramp-step="deposit-quick-start" gap="l" justify="flex-start">
      {showAssetSelector && (
        <Stack gap="base" justify="flex-start">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.quick.assetNetwork")}
          </Text>
          <ChainAssetSelectButton
            fullWidth
            showChainName
            placeholder={t("deposit.quick.selectAssetNetwork")}
            currentSelection={
              selectedAsset && selectedPair
                ? { asset: selectedAsset, chain: selectedPair.chain }
                : null
            }
            disabled={disabled || !pairs.length}
            aria-label={t("deposit.quick.selectAssetNetwork")}
            onClick={() => setSelectingAsset(true)}
          />
        </Stack>
      )}
      <Stack gap="base" justify="flex-start">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("deposit.quick.sourceWallet")}
        </Text>
        {compatible.length ? (
          <Select
            fullWidth
            size="medium"
            disabled={disabled}
            aria-label={t("deposit.quick.sourceWallet")}
            placeholder={t("deposit.quick.chooseAccount")}
            value={selectedSource ? sourceKey : undefined}
            iconSize={24}
            items={[
              ...compatible.map((account) => ({
                key: `${account.provider}:${account.address}`,
                label: `${account.name} · ${getWallet(account.provider)?.title ?? ""} · ${shortenAccountAddress(account.displayAddress)}`,
                icon: () => (
                  <AccountWalletAvatar
                    address={account.displayAddress}
                    provider={account.provider}
                    size={24}
                  />
                ),
              })),
              {
                key: "connectAnother",
                label: t("deposit.variants.connectAnother"),
                icon: () => (
                  <Flex align="center" justify="center">
                    <Icon component={Plus} size="m" />
                  </Flex>
                ),
              },
            ]}
            onValueChange={(key) => {
              if (key === "connectAnother") {
                setConnecting(true)
                return
              }
              const account = compatible.find(
                (account) => `${account.provider}:${account.address}` === key,
              )
              if (!account) return
              setSourceKey(key)
              selectSource(account)
            }}
          />
        ) : (
          <Button
            variant="tertiary"
            size="large"
            width="100%"
            disabled={disabled || !selectedAsset}
            onClick={() => setConnecting(true)}
          >
            <Icon component={Wallet} size="m" />
            {t("deposit.quick.connectWallet")}
          </Button>
        )}
      </Stack>
    </Stack>
  )

  if (
    directEntry ||
    (selectedPair &&
      selectedAsset &&
      selectedSource &&
      sameRoute &&
      selection.account.provider === selectedSource.provider &&
      selection.account.address === selectedSource.address)
  )
    return (
      <DepositGuidedDestination>
        {({ destination, ready, sourceHint }) => (
          <DepositPreviewForm
            key={`${chainKey}:${assetKey}:${selectedSource?.provider ?? ""}:${selectedSource?.address ?? ""}`}
            variant="simple"
            source={(disabled) => controls(disabled, false)}
            assetSelection={
              selectedPair && selectedAsset
                ? { chain: selectedPair.chain, asset: selectedAsset }
                : null
            }
            onAssetClick={() => setSelectingAsset(true)}
            assetSelectorDisabled={!pairs.length}
            destination={destination}
            footerHint={sourceHint}
            recipientReady={ready && !!selectedSource && sameRoute}
            onBack={back}
          />
        )}
      </DepositGuidedDestination>
    )

  return (
    <>
      <SOnrampStepHeader
        title={t("deposit.quick.title")}
        description={t("deposit.quick.description")}
        align="center"
        closable
        onBack={back}
      />
      <DepositScrollBody>
        <Stack gap="l" justify="flex-start">
          {controls()}
          <Flex justify="space-between" align="center" gap="base">
            <Text fs="p6" color={getToken("text.low")}>
              {t("deposit.quick.destination")}
            </Text>
            <Text fs="p6" color={getToken("text.low")}>
              Hydration
            </Text>
          </Flex>
          {!pairs.length && (
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.quick.noRoutes")}
            </Text>
          )}
        </Stack>
      </DepositScrollBody>
    </>
  )
}
