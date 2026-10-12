import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  AccountInput,
  Box,
  ButtonIcon,
  Flex,
  Icon,
  Label,
  Modal,
  ModalHeader,
  Separator,
  SpinnerIcon,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  Account,
  AddressBookModal,
  useAddresses,
  useAddressStore,
  WalletMode,
  Web3ConnectModal,
} from "@galacticcouncil/web3-connect"
import type { XcSwapPlatform } from "@galacticcouncil/xc-swap"
import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import {
  SRecipientContactsOption,
  SRecipientDropdown,
  SRecipientOption,
} from "@/modules/trade/swap/sections/XcSwap/components/XcSwapRecipientButton.styled"
import { useNearRecipientValidation } from "@/modules/trade/swap/sections/XcSwap/hooks/useNearRecipientValidation"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useRecentRecipientsStore } from "@/modules/trade/swap/sections/XcSwap/states/useRecentRecipientsStore"
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [committedAddress, setCommittedAddress] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const inputAnchorRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const savedCommitRef = useRef<string | null>(null)
  const [connectedAccount, setConnectedAccount] = useState<Account | null>(null)
  const savedAddresses = useAddresses()
  const addAddressToAddressBook = useAddressStore((state) => state.add)
  const recentAddresses = useRecentRecipientsStore(
    (state) => state.byChain[destChain.key],
  )
  const rememberRecipient = useRecentRecipientsStore((state) => state.remember)

  const destAddress = field.value.trim()
  const nearAccountStatus = useNearRecipientValidation(destChain, field.value)
  const nearAccountMessage =
    nearAccountStatus === "missing"
      ? t("trade:xc.swap.error.nearAccountNotFound")
      : nearAccountStatus === "unavailable"
        ? t("trade:xc.swap.error.nearAccountCheckFailed")
        : null
  const hasRecipientError = !!fieldState.error || !!nearAccountMessage

  const walletMode = DEST_WALLET_MODES[destChain.platform] ?? null
  const savedAddressSet = new Set(savedAddresses.map(({ address }) => address))
  const suggestions = [
    ...(recentAddresses ?? []).filter((address) =>
      savedAddressSet.has(address),
    ),
    ...[...savedAddresses]
      .reverse()
      .filter((address) => destChain.addressValidator(address.address))
      .map((address) => address.address),
  ]
    .filter((address, index, all) => all.indexOf(address) === index)
    .slice(0, 3)

  useEffect(() => {
    if (
      committedAddress === destAddress &&
      committedAddress !== "" &&
      savedCommitRef.current !== committedAddress &&
      destChain.addressValidator(committedAddress) &&
      (destChain.platform !== "near" || nearAccountStatus === "exists")
    ) {
      savedCommitRef.current = committedAddress
      rememberRecipient(destChain.key, destAddress)
      addAddressToAddressBook({
        address: destAddress,
        name: "",
        isCustom: true,
        isGlobal: true,
      })
    }
  }, [
    addAddressToAddressBook,
    committedAddress,
    destAddress,
    destChain,
    nearAccountStatus,
    rememberRecipient,
  ])

  useEffect(() => {
    if (!isDropdownOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !inputAnchorRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsDropdownOpen(false)
      }
    }

    const repositionDropdown = () => {
      const rect = inputAnchorRef.current?.getBoundingClientRect()
      if (!rect) return
      const errorRect = hasRecipientError
        ? inputAnchorRef.current?.nextElementSibling?.getBoundingClientRect()
        : null
      setDropdownPosition({
        top: (errorRect?.bottom ?? rect.bottom) + 8,
        left: rect.left,
        width: rect.width,
      })
    }

    repositionDropdown()

    document.addEventListener("pointerdown", closeOnOutsideClick)
    window.addEventListener("scroll", repositionDropdown, true)
    window.addEventListener("resize", repositionDropdown)

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      window.removeEventListener("scroll", repositionDropdown, true)
      window.removeEventListener("resize", repositionDropdown)
    }
  }, [hasRecipientError, isDropdownOpen])

  const openDropdown = () => {
    const rect = inputAnchorRef.current?.getBoundingClientRect()
    if (!rect) return
    const errorRect = hasRecipientError
      ? inputAnchorRef.current?.nextElementSibling?.getBoundingClientRect()
      : null

    setDropdownPosition({
      top: (errorRect?.bottom ?? rect.bottom) + 8,
      left: rect.left,
      width: rect.width,
    })
    setIsDropdownOpen(true)
  }

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
    setIsDropdownOpen(false)
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
        <Box ref={inputAnchorRef}>
          <AccountInput
            id={id}
            value={field.value}
            onChange={(address) => {
              setConnectedAccount(null)
              savedCommitRef.current = null
              setCommittedAddress(null)
              setValue("destAddress", address, { shouldValidate: true })
            }}
            onFocus={openDropdown}
            onClick={openDropdown}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsDropdownOpen(false)
              if (event.key === "ArrowDown") {
                event.preventDefault()
                dropdownRef.current?.querySelector("button")?.focus()
              }
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
                    aria-label={t("trade:xc.swap.field.checkingNearAccount")}
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
                      onClick={() => {
                        setIsDropdownOpen(false)
                        setIsContactsOpen(true)
                      }}
                    >
                      <Icon component={BookOpen} size="m" />
                    </ButtonIcon>
                  </Tooltip>
                )}
              </>
            }
          />
        </Box>
        {isDropdownOpen &&
          dropdownPosition &&
          createPortal(
            <SRecipientDropdown
              ref={dropdownRef}
              style={dropdownPosition}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsDropdownOpen(false)
              }}
            >
              {suggestions.map((address) => {
                const contact = savedAddresses.find(
                  (entry) => entry.address === address,
                )

                return (
                  <SRecipientOption
                    key={address}
                    type="button"
                    onClick={() => selectAddress(address)}
                  >
                    <AccountAvatar address={address} size={24} />
                    <Flex direction="column" sx={{ minWidth: 0 }}>
                      {contact?.name && <Text fs="p4">{contact.name}</Text>}
                      <Text
                        fs="p5"
                        color={getToken("text.medium")}
                        truncate={250}
                      >
                        {address}
                      </Text>
                    </Flex>
                  </SRecipientOption>
                )
              })}
              {suggestions.length > 0 && <Separator />}
              <SRecipientContactsOption
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  setIsContactsOpen(true)
                }}
              >
                <Icon component={BookOpen} size="m" aria-hidden="true" />
                <Text fs="p4">{t("trade:xc.swap.field.allContacts")}</Text>
              </SRecipientContactsOption>
            </SRecipientDropdown>,
            document.body,
          )}
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
      {walletMode && (
        <Modal
          variant="popup"
          open={isContactsOpen}
          onOpenChange={setIsContactsOpen}
        >
          <AddressBookModal
            header={
              <ModalHeader
                title={t("trade:xc.swap.field.allContacts")}
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
        <Web3ConnectModal
          neckwork={neckworkClient}
          papi={papi}
          open={isConnectModalOpen}
          mode={walletMode}
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
