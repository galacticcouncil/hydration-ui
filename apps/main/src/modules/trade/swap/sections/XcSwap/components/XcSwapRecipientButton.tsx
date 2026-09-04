import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  AccountInput,
  Box,
  ButtonIcon,
  Flex,
  Icon,
  InputSuggestions,
  InputSuggestionsOption,
  Label,
  Modal,
  ModalHeader,
  Separator,
  SpinnerIcon,
  Text,
  TextMiddleTruncate,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  Account,
  AddressBookModal,
  getWalletModeName,
  sortByLastUsed,
  useAddresses,
  useAddressStore,
  WalletMode,
  Web3ConnectModalV2,
} from "@galacticcouncil/web3-connect"
import type { XcSwapPlatform } from "@galacticcouncil/xc-swap"
import { useEffect, useId, useRef, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { useNearRecipientValidation } from "@/modules/trade/swap/sections/XcSwap/hooks/useNearRecipientValidation"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcChain } from "@/modules/trade/swap/sections/XcSwap/types"
import { ConnectButton } from "@/modules/xcm/transfer/components/ConnectButton"
import { useRpcProvider } from "@/providers/rpcProvider"

// Wallets that can receive on each destination; a destination not listed
// takes only a pasted or saved address
const DEST_WALLET_MODES: Partial<
  Record<XcSwapPlatform, WalletMode.Near | WalletMode.Zcash>
> = {
  near: WalletMode.Near,
  zec: WalletMode.Zcash,
}

const MAX_SUGGESTIONS = 3

type XcSwapRecipientButtonProps = {
  destChain: XcChain
}

export const XcSwapRecipientButton: React.FC<XcSwapRecipientButtonProps> = ({
  destChain,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const id = useId()
  const { papi } = useRpcProvider()
  const { control, setValue } = useFormContext<XcSwapFormValues>()
  const { field, fieldState } = useController({ control, name: "destAddress" })
  const [isContactsOpen, setIsContactsOpen] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [committedAddress, setCommittedAddress] = useState<string | null>(null)
  const savedCommitRef = useRef<string | null>(null)
  const [connectedAccount, setConnectedAccount] = useState<Account | null>(null)
  const savedAddresses = useAddresses()
  const addAddressToAddressBook = useAddressStore((state) => state.add)
  const touchAddress = useAddressStore((state) => state.touch)

  const destAddress = field.value.trim()
  const nearAccountStatus = useNearRecipientValidation(destChain, field.value)
  const nearAccountMessage =
    nearAccountStatus === "missing"
      ? t("trade:xc.swap.error.nearAccountNotFound")
      : nearAccountStatus === "unavailable"
        ? t("trade:xc.swap.error.nearAccountCheckFailed")
        : null

  const walletMode = DEST_WALLET_MODES[destChain.platform] ?? null
  const suggestions = sortByLastUsed(
    savedAddresses.filter(
      ({ address, mode }) =>
        (!walletMode || mode === walletMode) &&
        destChain.addressValidator(address),
    ),
  )
    .slice(0, MAX_SUGGESTIONS)
    .map(({ address }) => address)

  useEffect(() => {
    if (
      committedAddress === destAddress &&
      committedAddress !== "" &&
      savedCommitRef.current !== committedAddress &&
      destChain.addressValidator(committedAddress) &&
      (destChain.platform !== "near" || nearAccountStatus === "exists")
    ) {
      savedCommitRef.current = committedAddress
      addAddressToAddressBook({
        address: destAddress,
        name: "",
        isCustom: true,
        isGlobal: true,
      })
      touchAddress(destAddress)
    }
  }, [
    addAddressToAddressBook,
    committedAddress,
    destAddress,
    destChain,
    nearAccountStatus,
    touchAddress,
  ])

  // The connected account, while the swap still pays out to it
  const destAccount =
    connectedAccount?.rawAddress === destAddress ? connectedAccount : null
  const selectAddress = (address: string, account: Account | null = null) => {
    setConnectedAccount(account)
    savedCommitRef.current = null
    setCommittedAddress(address.trim())
    setValue("destAddress", address, {
      shouldValidate: true,
      shouldTouch: true,
    })
    setIsContactsOpen(false)
  }

  return (
    <>
      <Flex py="xl" direction="column" gap="m">
        <Flex justify="space-between" align="center" gap="m">
          <Label
            fw={500}
            fs="p5"
            lh="s"
            color={getToken("text.medium")}
            htmlFor={id}
          >
            {t("trade:xc.swap.field.destAddress")}
          </Label>
          {walletMode && (
            <ConnectButton
              walletProvider={destAccount?.provider}
              address={destAccount?.rawAddress}
              placeholder={t("connectWallet")}
              onClick={() => setIsConnectModalOpen(true)}
            />
          )}
        </Flex>
        <InputSuggestions
          open={suggestions.length > 0 ? undefined : false}
          anchor={(inputProps) => (
            <Flex direction="column" gap="m">
              <AccountInput
                {...inputProps}
                id={id}
                value={field.value}
                onChange={(address) => {
                  setConnectedAccount(null)
                  savedCommitRef.current = null
                  setCommittedAddress(null)
                  setValue("destAddress", address, { shouldValidate: true })
                }}
                onBlur={() => {
                  setCommittedAddress(field.value.trim())
                  field.onBlur()
                }}
                ref={field.ref}
                placeholder={t("trade:xc.swap.field.destAddressPlaceholder")}
                isError={!!fieldState.error || nearAccountStatus === "missing"}
                autoComplete="off"
                endAdornment={
                  <>
                    {nearAccountStatus === "checking" && (
                      <Box
                        as="span"
                        role="status"
                        aria-label={t(
                          "trade:xc.swap.field.checkingNearAccount",
                        )}
                        color={getToken("text.medium")}
                      >
                        <SpinnerIcon size="xs" aria-hidden="true" />
                      </Box>
                    )}
                    {walletMode && (
                      <Tooltip
                        text={t("trade:xc.swap.field.myContacts")}
                        size="small"
                        delayDuration={0}
                        side="bottom"
                        alignOffset={0}
                        asChild
                      >
                        <ButtonIcon
                          type="button"
                          aria-label={t("trade:xc.swap.field.myContacts")}
                          onClick={() => setIsContactsOpen(true)}
                        >
                          <Icon component={BookOpen} size="m" />
                        </ButtonIcon>
                      </Tooltip>
                    )}
                  </>
                }
              />
              {fieldState.error && (
                <Text fs="p5" color={getToken("accents.danger.secondary")}>
                  {fieldState.error.message}
                </Text>
              )}
              {!fieldState.error && nearAccountMessage && (
                <Text fs="p5" color={getToken("accents.danger.secondary")}>
                  {nearAccountMessage}
                </Text>
              )}
            </Flex>
          )}
        >
          {suggestions.map((address) => {
            const contact = savedAddresses.find(
              (entry) => entry.address === address,
            )

            return (
              <InputSuggestionsOption
                key={address}
                onSelect={() => selectAddress(address)}
              >
                <AccountAvatar address={address} size={24} />
                <Flex direction="column" flex={1} minWidth={0}>
                  {contact?.name && <Text fs="p4">{contact.name}</Text>}
                  <TextMiddleTruncate fs="p5" color={getToken("text.medium")}>
                    {address}
                  </TextMiddleTruncate>
                </Flex>
              </InputSuggestionsOption>
            )
          })}
          <Separator />
          <InputSuggestionsOption
            sx={{
              gap: "base",
              paddingBlock: "m",
              color: getToken("text.medium"),
            }}
            onSelect={() => setIsContactsOpen(true)}
          >
            <Icon component={BookOpen} size="m" aria-hidden="true" />
            <Text fs="p4">{t("trade:xc.swap.field.allContacts")}</Text>
          </InputSuggestionsOption>
        </InputSuggestions>
      </Flex>
      {walletMode && (
        <Modal
          variant="popup"
          open={isContactsOpen}
          onOpenChange={setIsContactsOpen}
        >
          <AddressBookModal
            header={
              <ModalHeader
                title={t("trade:xc.swap.field.modeContacts", {
                  mode: getWalletModeName(walletMode),
                })}
                align="center"
              />
            }
            whitelist={[walletMode]}
            onSelect={(address) => selectAddress(address.address)}
          />
        </Modal>
      )}
      {walletMode && (
        // Controlled: the account fills the destination and never
        // becomes the app's active account
        <Web3ConnectModalV2
          neckwork={neckworkClient}
          papi={papi}
          open={isConnectModalOpen}
          mode={walletMode}
          meta={{
            title: t("connectWallet.modal.title", { chain: destChain.name }),
            description: t("connectWallet.modal.description", {
              chain: destChain.name,
            }),
          }}
          onOpenChange={setIsConnectModalOpen}
          onAccountSelect={(account) => {
            setIsConnectModalOpen(false)
            selectAddress(account.rawAddress, account)
          }}
        />
      )}
    </>
  )
}
