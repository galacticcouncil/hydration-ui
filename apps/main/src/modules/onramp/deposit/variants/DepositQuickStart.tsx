import { CaretDown, Plus, Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  AccountTile,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
} from "@galacticcouncil/utils"
import {
  Account,
  AccountWalletAvatar,
  useAccount,
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
  const { account: activeAccount } = useAccount()
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
  const eligible = (account: Account) =>
    !!selectedPair &&
    !!selectedAsset &&
    canUseDepositAccount(account, selectedPair.chain)
  const compatible = accounts.filter(eligible)
  const sameRoute =
    selection?.chainKey === chainKey && selection?.assetKey === assetKey
  const selectedSource = sourceKey
    ? compatible.find(
        (account) => `${account.provider}:${account.address}` === sourceKey,
      )
    : sameRoute
      ? compatible.find(
          (account) =>
            account.provider === selection.account.provider &&
            account.address === selection.account.address,
        )
      : (compatible.find(
          (account) =>
            account.provider === activeAccount?.provider &&
            account.address === activeAccount.address,
        ) ?? (compatible.length === 1 ? compatible[0] : undefined))

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

  const controls = (disabled = false) => (
    <Stack data-onramp-step="deposit-quick-start" gap="l" justify="flex-start">
      <Stack gap="base" justify="flex-start">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("deposit.quick.assetNetwork")}
        </Text>
        <ChainAssetSelectButton
          fullWidth
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
      <Stack gap="base" justify="flex-start">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("deposit.quick.sourceWallet")}
        </Text>
        {compatible.length ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
              <Button
                variant="ghost"
                width="100%"
                aria-label={t("deposit.quick.sourceWallet")}
                sx={{
                  height: "auto",
                  p: "m",
                  borderRadius: "m",
                  gridTemplateColumns: "minmax(0, 1fr)",
                }}
              >
                <Flex gap="m" align="center" width="100%">
                  {selectedSource ? (
                    <AccountWalletAvatar
                      address={selectedSource.displayAddress}
                      provider={selectedSource.provider}
                      size={36}
                    />
                  ) : (
                    <Icon component={Wallet} size="m" />
                  )}
                  <Stack gap="s" flex={1} minWidth={0} align="start">
                    <Text fs="p3" fw={500} truncate>
                      {selectedSource?.name ?? t("deposit.quick.chooseAccount")}
                    </Text>
                    {selectedSource && (
                      <Text fs="p5" color={getToken("text.medium")}>
                        {getWallet(selectedSource.provider)?.title} ·{" "}
                        {shortenAccountAddress(selectedSource.displayAddress)}
                      </Text>
                    )}
                  </Stack>
                  <Icon component={CaretDown} size="s" />
                </Flex>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              size="small"
              sideOffset={6}
              collisionPadding={12}
              sx={{
                width: "var(--radix-dropdown-menu-trigger-width)",
                maxHeight:
                  "var(--radix-dropdown-menu-content-available-height)",
                overflowY: "auto",
              }}
            >
              {compatible.map((account) => (
                <DropdownMenuItem
                  key={`${account.provider}:${account.address}`}
                  asChild
                >
                  <AccountTile
                    name={`${getWallet(account.provider)?.title ?? ""} · ${account.name}`}
                    address={account.displayAddress}
                    walletLogoSrc={getWallet(account.provider)?.logo}
                    active={
                      selectedSource?.provider === account.provider &&
                      selectedSource.address === account.address
                    }
                    width="100%"
                    sx={{ textAlign: "left" }}
                    onClick={
                      disabled
                        ? undefined
                        : () => {
                            setSourceKey(
                              `${account.provider}:${account.address}`,
                            )
                            selectSource(account)
                          }
                    }
                  />
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                disabled={disabled}
                onSelect={() => setConnecting(true)}
              >
                <Icon component={Plus} size="m" />
                {t("deposit.variants.connectAnother")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    selectedPair &&
    selectedAsset &&
    selectedSource &&
    sameRoute &&
    selection.account.provider === selectedSource.provider &&
    selection.account.address === selectedSource.address
  )
    return (
      <DepositGuidedDestination>
        {({ destination, ready }) => (
          <DepositPreviewForm
            key={`${chainKey}:${assetKey}:${selectedSource.provider}:${selectedSource.address}`}
            variant="simple"
            source={controls}
            destination={destination}
            recipientReady={ready}
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
