import {
  AccountAvatar,
  Flex,
  InputSuggestions,
  InputSuggestionsOption,
  ModalBody,
  Separator,
  Stack,
  Stepper,
  Text,
  TextMiddleTruncate,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  formatDestChainAddress,
  getChainId,
  HYDRATION_CHAIN_KEY,
  isAddressValidOnChain,
} from "@galacticcouncil/utils"
import {
  AddressBook,
  AddressBookModal,
  sortByLastUsed,
  useAccount,
  useAddresses,
  useAddressStore,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { ComponentProps, FC, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  useCrossChainBalance,
  useCrossChainConfigService,
  useHydrationAssetId,
} from "@/api/xcm"
import { ChainLogo } from "@/components/ChainLogo"
import { OnrampAssetAmount } from "@/modules/onramp/components/OnrampAssetAmount"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { OnrampTransferSummary } from "@/modules/onramp/components/OnrampTransferSummary"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawRouteSelect } from "@/modules/onramp/withdraw/components/WithdrawRouteSelect"
import { WithdrawSourceAccount } from "@/modules/onramp/withdraw/components/WithdrawSourceAccount"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import { WithdrawDestinationOption } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { canUseWithdrawAccount } from "@/modules/onramp/withdraw/WithdrawOnchain.utils"
import { WithdrawRecipientSelect } from "@/modules/onramp/withdraw/WithdrawRecipientSelect"
import {
  insertOptimisticJourney,
  removeOptimisticJourney,
} from "@/modules/xcm/history/utils/optimistic"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { ConnectButton } from "@/modules/xcm/transfer/components/ConnectButton"
import { ConnectChainTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import { RecipientSelectPage } from "@/modules/xcm/transfer/components/Recipient/RecipientSelectPage"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { XcmFooter } from "@/modules/xcm/transfer/XcmFooter"
import { useAssetPrice } from "@/states/displayAsset"

import { getWithdrawSelectionFormValues } from "./WithdrawOnchainAsset.utils"

export const WithdrawOnchainForm: FC = () => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const connected = useDepositAccounts()
  const destinationOptions = useWithdrawDestinationOptions()
  const [isDestinationFlowOpen, setIsDestinationFlowOpen] = useState(false)
  const savedAddresses = useAddresses()
  const touchAddress = useAddressStore((state) => state.touch)
  const paginateTo = useOnrampModal((state) => state.paginateWithdraw)
  const flow = useOnrampModal((state) => state.withdrawFlow)
  const selectedRoute = useOnrampModal((state) => state.withdrawSelection)
  const config = useCrossChainConfigService()
  const { transfer, isConnectedAccountValid, isLoadingSrcBalances } =
    useXcmProvider()
  const { watch, handleSubmit, setValue, getValues, reset } =
    useFormContext<XcmFormValues>()
  const [srcChain, srcAsset, destChain, destAsset, destAddress, destAccount] =
    watch([
      "srcChain",
      "srcAsset",
      "destChain",
      "destAsset",
      "destAddress",
      "destAccount",
    ])
  const isSourceCompatible =
    srcChain?.key === HYDRATION_CHAIN_KEY &&
    canUseWithdrawAccount(account) &&
    connected.some(
      (source) =>
        source.address === account.address &&
        source.provider === account.provider,
    )
  const address = isSourceCompatible ? account.address : ""
  const { data: sourceBalances } = useCrossChainBalance(
    address,
    HYDRATION_CHAIN_KEY,
  )
  const getHydrationAssetId = useHydrationAssetId()
  const { price } = useAssetPrice(
    srcAsset
      ? (getHydrationAssetId(srcAsset, HYDRATION_CHAIN_KEY) ?? undefined)
      : undefined,
  )
  const resetAmounts = useResetAmounts()
  const queryClient = useQueryClient()
  const submit = useSubmitXcmTransfer({
    onTransferSubmitted: (txHash, values, transfer) => {
      if (account) {
        insertOptimisticJourney(
          queryClient,
          account.address,
          txHash,
          values,
          transfer,
        )
      }
      void resetAmounts()
    },
    onTransferError: (txHash) => {
      if (account) removeOptimisticJourney(queryClient, account.address, txHash)
    },
  })
  useEffect(() => {
    useOnrampModal.setState({ withdrawPending: submit.isPending })
    return () => useOnrampModal.setState({ withdrawPending: false })
  }, [submit.isPending])

  const [isEditingDestination, setIsEditingDestination] = useState(false)
  const [isRecipientOpen, setIsRecipientOpen] = useState(false)
  const [isChangingRecipient, setIsChangingRecipient] = useState(false)
  const [isRecipientWalletOpen, setIsRecipientWalletOpen] = useState(
    flow === "connected" && !destAddress,
  )
  const [isRouteOpen, setIsRouteOpen] = useState(false)
  const [recipientInput, setRecipientInput] = useState(destAddress)
  const isRecipientValid =
    !!destChain && isAddressValidOnChain(recipientInput.trim(), destChain)
  const updateRecipient = (value: string) => {
    setRecipientInput(value)
    setValue(
      "destAddress",
      destChain && isAddressValidOnChain(value.trim(), destChain)
        ? value.trim()
        : "",
      { shouldValidate: true },
    )
    setValue("destAccount", null)
  }
  const back = () => {
    if (!submit.isPending) paginateTo(OnrampScreen.WithdrawOnchainAsset)
  }
  const chooseWallet = () => {
    if (!submit.isPending) paginateTo(OnrampScreen.WithdrawOnchainWallet)
  }
  const chooseRoute = () => {
    if (!submit.isPending) setIsRouteOpen(true)
  }
  const selectRoute = (option: WithdrawDestinationOption) => {
    if (submit.isPending) return
    const selection = {
      assetId: option.assetId,
      sourceAssetKey: option.sourceAssetKey,
      destinationChainKey: option.destinationChainKey,
      destinationAssetKey: option.destinationAssetKey,
      recipient: destAddress
        ? { address: destAddress, account: destAccount ?? undefined }
        : undefined,
    }

    if (option.destinationChainKey === HYDRATION_CHAIN_KEY) {
      useOnrampModal.getState().selectWithdrawAsset(selection)
      return
    }

    const sourceChain = config.chains.get(HYDRATION_CHAIN_KEY)
    if (!sourceChain) return
    const isSameRoute =
      srcChain?.key === HYDRATION_CHAIN_KEY &&
      srcAsset?.key === option.sourceAssetKey &&
      destChain?.key === option.destinationChainKey &&
      destAsset?.key === option.destinationAssetKey

    if (!isSameRoute) {
      const next = getWithdrawSelectionFormValues(getValues(), {
        sourceChain,
        sourceAsset: option.sourceAsset,
        destinationChain: option.destinationChain,
        destinationAsset: option.destinationAsset,
      })
      reset(next)
      setRecipientInput(next.destAddress)
    }
    useOnrampModal.setState({
      withdrawAssetId: selection.assetId,
      withdrawSelection: selection,
    })
    setIsRouteOpen(false)
  }

  const destinationMode = destChain
    ? getWalletModeByChain(destChain)
    : WalletMode.Default
  const recipientModes: ComponentProps<typeof AddressBookModal>["whitelist"] =
    destinationMode === WalletMode.Default
      ? undefined
      : destinationMode === WalletMode.SubstrateEVM
        ? [WalletMode.Substrate, WalletMode.EVM]
        : destinationMode === WalletMode.SubstrateH160
          ? [WalletMode.EVM]
          : destinationMode === WalletMode.Near
            ? [WalletMode.Near, WalletMode.EVM]
            : [destinationMode]
  const suggestions = sortByLastUsed(
    savedAddresses.filter(
      (entry) =>
        !!destChain &&
        isAddressValidOnChain(entry.address, destChain) &&
        (!recipientModes || recipientModes.includes(entry.mode)),
    ),
  ).slice(0, 3)

  if (isDestinationFlowOpen && srcAsset)
    return (
      <WithdrawRecipientSelect
        startInSplit
        initialRecipient={
          destAddress && !isEditingDestination
            ? { address: destAddress, account: destAccount ?? undefined }
            : undefined
        }
        sourceAssetKey={srcAsset.key}
        onBack={() => {
          setIsDestinationFlowOpen(false)
          setIsEditingDestination(false)
        }}
        onSelect={(selection) => {
          const option = destinationOptions.find(
            (option) =>
              option.sourceAssetKey === selection.sourceAssetKey &&
              option.destinationChainKey === selection.destinationChainKey &&
              option.destinationAssetKey === selection.destinationAssetKey,
          )
          if (!option || !srcChain || !selection.recipient) return
          if (selection.destinationChainKey !== HYDRATION_CHAIN_KEY) {
            const next = getWithdrawSelectionFormValues(getValues(), {
              sourceChain: srcChain,
              sourceAsset: option.sourceAsset,
              destinationChain: option.destinationChain,
              destinationAsset: option.destinationAsset,
            })
            const address = formatDestChainAddress(
              selection.recipient.address,
              option.destinationChain,
            )
            reset({
              ...next,
              destAddress: address,
              destAccount: selection.recipient.account ?? null,
            })
            setRecipientInput(address)
          }
          useOnrampModal.getState().selectWithdrawAsset(selection)
          setIsDestinationFlowOpen(false)
          setIsEditingDestination(false)
        }}
      />
    )

  if (isRouteOpen)
    return (
      <WithdrawRouteSelect
        editing
        destinationChainKey={destChain?.key}
        initialSelection={selectedRoute}
        onBack={() => {
          setIsRouteOpen(false)
        }}
        onSelect={(option) => {
          selectRoute(option)
        }}
      />
    )

  if (isRecipientWalletOpen && destChain)
    return (
      <RecipientSelectPage
        onBack={() => {
          if (isChangingRecipient) {
            setIsRecipientWalletOpen(false)
            setIsChangingRecipient(false)
          } else back()
        }}
        onSelectAddress={(address, recipient) => {
          updateRecipient(address)
          setValue("destAccount", recipient ?? null)
          setIsRecipientWalletOpen(false)
          setIsChangingRecipient(false)
        }}
      />
    )

  if (isRecipientOpen)
    return (
      <AddressBookModal
        align="center"
        whitelist={recipientModes}
        onBack={() => setIsRecipientOpen(false)}
        onSelect={({ address }) => {
          updateRecipient(address)
          setIsRecipientOpen(false)
        }}
      />
    )

  return (
    <>
      <SOnrampStepHeader
        title={
          flow === "simple"
            ? t("withdraw.quick.title")
            : destChain
              ? t("withdraw.onchain.form.destinationTitle", {
                  chain: destChain.name,
                })
              : t("withdraw.onchain.form.title")
        }
        description={
          flow === "simple" ? t("withdraw.quick.description") : undefined
        }
        align="center"
        onBack={
          submit.isPending
            ? undefined
            : flow === "connected"
              ? () => setIsDestinationFlowOpen(true)
              : back
        }
        closable
      />
      <ModalBody noPadding scrollable={false}>
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="s" justify="flex-start">
          {flow === "guided" && (
            <Stepper
              compact
              steps={[
                t("withdraw.guided.step.asset"),
                t("withdraw.guided.step.network"),
                t("withdraw.guided.step.withdraw"),
              ]}
              activeStepIndex={2}
              mb="m"
            />
          )}
          {flow === "simple" && (
            <Stack gap="s" justify="flex-start" mb="m">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("withdraw.quick.assetNetwork")}
              </Text>
              <ChainAssetSelectButton
                fullWidth
                currentSelection={
                  srcAsset && destChain
                    ? { asset: srcAsset, chain: destChain }
                    : null
                }
                aria-label={t("withdraw.quick.selectAssetNetwork")}
                disabled={submit.isPending}
                onClick={chooseRoute}
              />
            </Stack>
          )}
          {flow === "current" ? (
            <>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("withdraw.onchain.form.sourceAccount")}
              </Text>
              {isSourceCompatible ? (
                <DepositAccountButton
                  active
                  name={account.name}
                  address={account.displayAddress}
                  onClick={chooseWallet}
                />
              ) : (
                <ConnectChainTile
                  chain={srcChain}
                  onConnect={chooseWallet}
                  p="m"
                />
              )}
            </>
          ) : (
            <WithdrawSourceAccount
              account={isSourceCompatible ? account : null}
              disabled={submit.isPending}
              onChange={chooseWallet}
            />
          )}
        </Stack>
        <Separator />
        <OnrampAssetAmount
          variant="transaction"
          label={t("common:from")}
          selection={
            srcChain && srcAsset ? { chain: srcChain, asset: srcAsset } : null
          }
          onAssetClick={flow === "simple" ? undefined : chooseRoute}
          amountProps={{
            fieldName: "srcAmount",
            balance: sourceBalances?.get(srcAsset?.key ?? ""),
            balanceMax: transfer?.source.max,
            withMaxButton: true,
            assetPrice: price,
            isLoading: isLoadingSrcBalances,
            isBalanceLoading: isLoadingSrcBalances,
            disabled:
              !srcAsset ||
              !isSourceCompatible ||
              !isConnectedAccountValid ||
              isLoadingSrcBalances,
          }}
        />
        <Separator />
        <Stack px={["l", "xl"]} pt={["m", "l"]} gap="0" justify="flex-start">
          {destChain && (
            <Flex align="center" gap="s">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:to")}
              </Text>
              <ChainLogo
                ecosystem={destChain.ecosystem}
                chainId={getChainId(destChain)}
                size="extra-small"
                alt={destChain.name}
              />
              <Text fs="p5" fw={500} color={getToken("text.high")}>
                {destChain.name}
              </Text>
            </Flex>
          )}
          {destAddress && isRecipientValid ? (
            <DepositAccountButton
              active
              name={destAccount?.name || t("deposit.onchain.customAddress")}
              address={destAddress}
              disabled={submit.isPending}
              onChange={() => {
                setIsEditingDestination(true)
                setIsDestinationFlowOpen(true)
              }}
            />
          ) : (
            <InputSuggestions
              open={suggestions.length > 0 ? undefined : false}
              anchor={(inputProps) => (
                <AddressBook
                  inputProps={inputProps}
                  address={recipientInput}
                  onAddressChange={updateRecipient}
                  onOpenMyContacts={() => setIsRecipientOpen(true)}
                  contactsVariant="icon"
                  headerAction={
                    destinationMode !== WalletMode.Default ? (
                      <ConnectButton
                        walletProvider={destAccount?.provider}
                        address={destAccount?.rawAddress}
                        placeholder={t("common:connectWallet")}
                        onClick={() => {
                          setIsChangingRecipient(true)
                          setIsRecipientWalletOpen(true)
                        }}
                      />
                    ) : undefined
                  }
                  error={
                    recipientInput && !isRecipientValid
                      ? t("common:error.validAddressOnChain", {
                          chain: destChain?.name,
                        })
                      : undefined
                  }
                />
              )}
            >
              {suggestions.map((entry) => (
                <InputSuggestionsOption
                  key={entry.publicKey}
                  onSelect={() => {
                    updateRecipient(entry.address)
                    touchAddress(entry.address)
                  }}
                >
                  <AccountAvatar address={entry.address} size={32} />
                  <Flex direction="column" flex={1} minWidth={0}>
                    {entry.name && (
                      <Text fs="p4" fw={500}>
                        {entry.name}
                      </Text>
                    )}
                    <TextMiddleTruncate fs="p5" color={getToken("text.medium")}>
                      {entry.address}
                    </TextMiddleTruncate>
                  </Flex>
                </InputSuggestionsOption>
              ))}
            </InputSuggestions>
          )}
        </Stack>
        <OnrampTransferSummary />
        <Separator />
        <XcmFooter
          isSubmitting={submit.isPending}
          canSubmit={isSourceCompatible && isRecipientValid}
          submitLabel={t("withdraw.onchain.form.confirm")}
          onSubmit={() => {
            void handleSubmit((values) => {
              if (
                transfer &&
                isSourceCompatible &&
                isRecipientValid &&
                values.srcChain?.key === HYDRATION_CHAIN_KEY
              )
                submit.mutate([values, transfer])
            })()
          }}
        />
      </ModalBody>
    </>
  )
}
