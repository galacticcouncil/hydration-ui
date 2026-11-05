import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  AccountAvatar,
  Alert,
  Box,
  Button,
  Flex,
  InputSuggestions,
  InputSuggestionsOption,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Summary,
  SummaryRow,
  Text,
  TextMiddleTruncate,
  Toggle,
} from "@galacticcouncil/ui/components"
import {
  accountPublicKey,
  isAddressValidOnHydration,
  normalizeSS58Address,
  safeConvertSS58toPublicKey,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  Account,
  AddressBookModal,
  sortByLastUsed,
  useAccount,
  useAddresses,
  useAddressStore,
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC, ReactNode, useEffect, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { healthFactorAfterWithdrawQuery } from "@/api/aave"
import { neckworkClient } from "@/api/neckwork"
import { AssetSelectModalContent } from "@/components/AssetSelectModal"
import { AddressBookFormField } from "@/form/AddressBookFormField"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import {
  TransferPositionFormValues,
  useTransferPosition,
} from "@/modules/portfolio/overview/Transfer/TransferPosition.form"
import { useSubmitTransferPosition } from "@/modules/portfolio/overview/Transfer/TransferPositionModal.submit"
import { TransferPositionSummary } from "@/modules/portfolio/overview/Transfer/TransferPositionSummary"
import { isErc20AToken, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly assetId?: string
  readonly header?:
    | ReactNode
    | ((pending: boolean, onDestinationBack?: () => void) => ReactNode)
  readonly defaultAddress?: string
  readonly defaultRecipient?: Account | null
  readonly sourceAccount?: Account
  readonly lockAsset?: boolean
  readonly onAssetClick?: () => void
  readonly inlineAssetSelection?: boolean
  readonly assetLabel?: ReactNode
  readonly onPendingChange?: (pending: boolean) => void
  readonly renderDestinationPicker?: (props: {
    assetId: string
    onBack: () => void
    onSelect: (address: string, account?: Account) => void
  }) => ReactNode
  readonly onRecipientWidthChange?: (width: string | null) => void
  readonly showTransferSummary?: boolean
  readonly onBack?: () => void
  readonly onClose: () => void
}

export const TransferPositionModal: FC<Props> = ({
  assetId,
  header,
  defaultRecipient,
  defaultAddress,
  sourceAccount,
  lockAsset = false,
  onAssetClick,
  inlineAssetSelection = false,
  assetLabel,
  onPendingChange,
  onRecipientWidthChange,
  renderDestinationPicker,
  showTransferSummary = false,
  onBack,
  onClose,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const { account } = useAccount()
  const { tradable, native } = useAssets()
  const rpc = useRpcProvider()

  const transferPosition = useSubmitTransferPosition({ onClose })
  useEffect(() => {
    onPendingChange?.(transferPosition.isPending)
    return () => onPendingChange?.(false)
  }, [onPendingChange, transferPosition.isPending])
  const { form, getMaxBalance } = useTransferPosition({
    assetId,
    defaultAddress: defaultAddress ?? defaultRecipient?.rawAddress,
  })
  const isSourceCurrent =
    !sourceAccount ||
    (account?.provider === sourceAccount.provider &&
      account.address === sourceAccount.address)
  const shouldValidate = form.formState.isSubmitted

  const [isMyContactsOpen, setIsMyContactsOpen] = useState(false)
  const [isAssetSelectionOpen, setIsAssetSelectionOpen] = useState(false)
  const [isRecipientWalletOpen, setIsRecipientWalletOpen] = useState(false)
  useEffect(() => {
    if (!isRecipientWalletOpen) return
    return () => onRecipientWidthChange?.(null)
  }, [isRecipientWalletOpen, onRecipientWidthChange])
  const [connectedRecipient, setConnectedRecipient] = useState<Account | null>(
    defaultRecipient ?? null,
  )

  const [asset, amount, address] = form.watch(["asset", "amount", "address"])

  const { data: healthFactor } = useQuery(
    healthFactorAfterWithdrawQuery(rpc, {
      address: account?.address ?? "",
      fromAssetId: asset && isErc20AToken(asset) ? asset.underlyingAssetId : "",
      fromAmount: amount,
    }),
  )

  const [cexDisclaimerAccepted, setCexDisclaimerAccepted] = useState(false)
  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const { watch } = form
  useEffect(() => {
    const subscription = watch((_, { type }) => {
      if (type !== "change") {
        return
      }

      setHealthFactorRiskAccepted(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [watch])

  const { add: addAddressToAddressBook, touch: touchAddress } =
    useAddressStore()
  const userOwnedAddresses = useAddresses()
  const recipientAccount =
    connectedRecipient?.rawAddress === address ? connectedRecipient : null
  const isEligibleRecipient = (address: string) =>
    isAddressValidOnHydration(address) &&
    accountPublicKey(address) !==
      accountPublicKey((sourceAccount ?? account)?.rawAddress ?? "")
  const recipientSearch = address.trim().toLowerCase()
  const suggestions = sortByLastUsed(
    userOwnedAddresses.filter(
      (entry) =>
        isEligibleRecipient(entry.address) &&
        (entry.mode === WalletMode.Substrate ||
          entry.mode === WalletMode.EVM) &&
        (!recipientSearch ||
          entry.address.toLowerCase().includes(recipientSearch) ||
          entry.name.toLowerCase().includes(recipientSearch)),
    ),
  ).slice(0, 3)

  const addCustomRecipient = (recipient: string) => {
    addAddressToAddressBook({
      address: recipient,
      name: "",
      isCustom: true,
    })
  }

  const isUserOwnedAddress = userOwnedAddresses.some(({ publicKey }) =>
    stringEquals(
      publicKey,
      safeConvertSS58toPublicKey(normalizeSS58Address(address)),
    ),
  )

  const isNonNativeAsset = asset && asset.id !== native.id
  const shouldShowCexDisclaimer =
    isNonNativeAsset && form.formState.isValid && !isUserOwnedAddress

  const isHealthFactorCheckSatisfied = healthFactor?.isUserConsentRequired
    ? healthFactorRiskAccepted
    : true

  const isCexDisclaimerSatisfied = shouldShowCexDisclaimer
    ? cexDisclaimerAccepted
    : true

  if (isAssetSelectionOpen)
    return (
      <>
        <ModalHeader
          title={t("common:selectAsset")}
          align="center"
          sx={{ py: "m" }}
          onBack={() => setIsAssetSelectionOpen(false)}
          closable
        />
        <Box
          sx={{
            minHeight: 0,
            overflowY: "auto",
            maxHeight: "min(500px, 65dvh)",
          }}
        >
          <AssetSelectModalContent
            searchInputVariant="standalone"
            height={450}
            assets={tradable}
            selectedAssetId={asset?.id}
            onSelect={(selected) => {
              form.setValue("asset", selected)
              form.setValue("amount", "")
              setIsAssetSelectionOpen(false)
            }}
          />
        </Box>
      </>
    )

  if (isRecipientWalletOpen && renderDestinationPicker && asset)
    return renderDestinationPicker({
      assetId: asset.id,
      onBack: () => setIsRecipientWalletOpen(false),
      onSelect: (address, account) => {
        form.setValue("address", address, { shouldValidate: true })
        setConnectedRecipient(account ?? null)
        setIsRecipientWalletOpen(false)
      },
    })

  if (isRecipientWalletOpen)
    return (
      <Web3ConnectPage
        layout="split"
        walletFirst
        walletListWidth={520}
        onContentWidthChange={onRecipientWidthChange}
        onBack={() => setIsRecipientWalletOpen(false)}
        neckwork={neckworkClient}
        papi={rpc.papi}
        mode={WalletMode.SubstrateEVM}
        meta={{
          title: t("common:connectWallet.modal.title", { chain: "Hydration" }),
          description: t("common:connectWallet.modal.description", {
            chain: "Hydration",
          }),
          closable: true,
          filteredAccountsEmpty: {
            title: t("transfer.recipient.empty.title"),
            description: t("transfer.recipient.empty.description"),
          },
        }}
        accountFilter={(recipient) => isEligibleRecipient(recipient.rawAddress)}
        onAccountSelect={(recipient) => {
          if (!isEligibleRecipient(recipient.rawAddress)) return
          form.setValue("address", recipient.rawAddress, {
            shouldValidate: true,
            shouldTouch: true,
          })
          setConnectedRecipient(recipient)
          setIsRecipientWalletOpen(false)
        }}
      />
    )

  if (isMyContactsOpen) {
    return (
      <AddressBookModal
        whitelist={[WalletMode.Substrate, WalletMode.EVM]}
        onBack={() => setIsMyContactsOpen(false)}
        onSelect={(address) => {
          form.setValue("address", address.address, { shouldValidate })
          setIsMyContactsOpen(false)
        }}
      />
    )
  }

  return (
    <FormProvider {...form}>
      <Box
        as="form"
        display={showTransferSummary ? "flex" : undefined}
        flex={showTransferSummary ? 1 : undefined}
        sx={
          showTransferSummary
            ? { flexDirection: "column", minHeight: 0 }
            : undefined
        }
        onSubmit={form.handleSubmit((values) => {
          const active = useWeb3Connect.getState().account
          if (
            sourceAccount &&
            (active?.provider !== sourceAccount.provider ||
              active.address !== sourceAccount.address)
          )
            return
          addCustomRecipient(values.address)
          transferPosition.mutate(values)
        })}
      >
        {(typeof header === "function"
          ? header(
              transferPosition.isPending,
              renderDestinationPicker
                ? () => {
                    setIsRecipientWalletOpen(true)
                  }
                : undefined,
            )
          : header) ?? (
          <ModalHeader
            align="center"
            title={t("transfer.modal.title")}
            onBack={onBack}
          />
        )}
        <ModalBody
          sx={{
            py: 0,
            ...(showTransferSummary && { overflowY: "auto", minHeight: 0 }),
          }}
        >
          <ModalContentDivider />
          <Box py="l" width="100%">
            <AssetSelectFormField<TransferPositionFormValues>
              label={assetLabel ?? t("transfer.modal.asset.label")}
              assetFieldName="asset"
              amountFieldName="amount"
              balance={{ value: getMaxBalance(asset) }}
              assets={tradable}
              disabledAssetSelector={lockAsset}
              onAssetClick={
                inlineAssetSelection
                  ? () => setIsAssetSelectionOpen(true)
                  : onAssetClick
              }
            />
          </Box>
          <ModalContentDivider />
          {renderDestinationPicker &&
          address &&
          isEligibleRecipient(address) ? (
            <Box py="l">
              <DepositAccountButton
                active
                name={
                  recipientAccount?.name ||
                  t("transfer.recipient.customAddress")
                }
                address={address}
                disabled={transferPosition.isPending}
                onChange={() => {
                  setIsRecipientWalletOpen(true)
                }}
              />
            </Box>
          ) : (
            <InputSuggestions
              open={suggestions.length > 0 ? undefined : false}
              anchor={(inputProps) => (
                <AddressBookFormField<TransferPositionFormValues>
                  fieldName="address"
                  inputProps={inputProps}
                  contactsVariant="icon"
                  headerAction={
                    <Button
                      type="button"
                      size="micro"
                      uppercase
                      variant="secondary"
                      outline
                      disabled={transferPosition.isPending}
                      onClick={() => setIsRecipientWalletOpen(true)}
                    >
                      {t(
                        recipientAccount
                          ? "common:change"
                          : "common:connectWallet",
                      )}
                    </Button>
                  }
                  onOpenMyContacts={() => setIsMyContactsOpen(true)}
                />
              )}
            >
              {suggestions.map((entry) => (
                <InputSuggestionsOption
                  key={entry.publicKey}
                  onSelect={() => {
                    form.setValue("address", entry.address, {
                      shouldValidate: true,
                      shouldTouch: true,
                    })
                    setConnectedRecipient(null)
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
                    <TextMiddleTruncate fs="p5" color="text.medium">
                      {entry.address}
                    </TextMiddleTruncate>
                  </Flex>
                </InputSuggestionsOption>
              ))}
            </InputSuggestions>
          )}

          {healthFactor?.isSignificantChange && (
            <Summary separator={<ModalContentDivider />} withLeadingSeparator>
              <SummaryRow
                label={t("common:healthFactor")}
                content={<HealthFactorChange {...healthFactor} />}
              />
            </Summary>
          )}
          <ModalContentDivider />
          {showTransferSummary && (
            <TransferPositionSummary
              asset={asset}
              amount={amount}
              address={address}
              isSourceCurrent={isSourceCurrent}
            />
          )}
        </ModalBody>
        <ModalFooter
          display="grid"
          sx={{
            justifyContent: "space-between",
            flexDirection: "row",
            gridTemplateColumns: "1fr",
            gap: "xl",
          }}
        >
          {healthFactor && (
            <HealthFactorRiskWarning
              message={t("common:healthFactor.warning")}
              accepted={healthFactorRiskAccepted}
              onAcceptedChange={setHealthFactorRiskAccepted}
              isUserConsentRequired={healthFactor.isUserConsentRequired}
            />
          )}
          {isNonNativeAsset && (
            <Alert
              variant="warning"
              description={t("transfer.modal.warning.nonNative")}
              action={
                shouldShowCexDisclaimer && (
                  <Flex as="label" gap="base" align="center">
                    <Toggle
                      size="large"
                      checked={cexDisclaimerAccepted}
                      onCheckedChange={setCexDisclaimerAccepted}
                    />
                    <Text fs="p4" lh={1.3} fw={600}>
                      {t("transfer.modal.acceptance.cex")}
                    </Text>
                  </Flex>
                )
              }
            />
          )}
          <Button
            size="large"
            variant="tertiary"
            display={[null, "none"]}
            onClick={onClose}
          >
            {t("common:cancel")}
          </Button>
          <LoadingButton
            isLoading={transferPosition.isPending}
            size="large"
            type="submit"
            disabled={
              !isSourceCurrent ||
              !isHealthFactorCheckSatisfied ||
              !isCexDisclaimerSatisfied ||
              !form.formState.isValid
            }
          >
            {t("common:confirm")}
          </LoadingButton>
        </ModalFooter>
      </Box>
    </FormProvider>
  )
}
