import { Flex, ModalBody } from "@galacticcouncil/ui/components"
import {
  normalizeSS58Address,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import {
  getWalletModeByAddress,
  PROVIDERS_BY_WALLET_MODE,
  WalletMode,
  Web3ConnectAccount,
} from "@galacticcouncil/web3-connect"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { filter, pipe, sortBy } from "remeda"

import {
  AccountFilter,
  AccountFilterOption,
  AccountFilterOptionOverride,
  allAccountFilterOptions,
} from "@/components/account/AccountFilter"
import { AccountRemoveModal } from "@/components/account/AccountRemoveModal"
import {
  Address,
  useAddressStore,
} from "@/components/address-book/AddressBook.store"
import { AddressBookEmptyState } from "@/components/address-book/AddressBookEmptyState"
import { AddressBookSearch } from "@/components/address-book/AddressBookSearch"
import i18n from "@/i18n"

type Props = {
  readonly header?: React.ReactNode
  readonly align?: "default" | "center"
  readonly whitelist?: ReadonlyArray<AccountFilterOptionOverride>
  readonly blacklist?: ReadonlyArray<AccountFilterOptionOverride>
  readonly onSelect?: (address: Address) => void
}

export const AddressBookModal: FC<Props> = ({
  header,
  align = "default",
  whitelist,
  blacklist,
  onSelect,
}) => {
  const { t } = useTranslation("translations", { i18n })
  const [publicKeyToRemove, setPublicKeyToRemove] = useState("")
  const [searchPhrase, setSearchPhrase] = useState("")

  const [accountFilter, setAccountFilter] = useState<AccountFilterOption>(
    whitelist ? (whitelist[0] ?? WalletMode.Default) : WalletMode.Default,
  )

  const { addresses: allAddresses, add, edit, remove } = useAddressStore()

  const allAddressesProviders = new Set(
    allAddresses.map((address) => address.provider),
  )

  const validFilterOptions = whitelist ?? allAccountFilterOptions

  const filterOptions = validFilterOptions.filter((mode) =>
    PROVIDERS_BY_WALLET_MODE[mode].some((provider) =>
      allAddressesProviders.has(provider),
    ),
  )

  const validProviders = PROVIDERS_BY_WALLET_MODE[accountFilter]

  const filteredAddresses = pipe(
    allAddresses,
    filter((address) => validProviders.includes(address.provider)),
    sortBy(
      [(address) => address.isCustom || false, "desc"],
      [(address) => address.name.toLocaleLowerCase(), "asc"],
    ),
  )

  const searchedAddresses = filteredAddresses.filter(
    (address) =>
      address.name.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      address.address.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      address.publicKey.toLowerCase().includes(searchPhrase.toLowerCase()),
  )

  const addressProvider = getWalletModeByAddress(searchPhrase)
  const addressPublicKey = safeConvertSS58toPublicKey(
    normalizeSS58Address(searchPhrase),
  )

  const canAdd =
    !searchedAddresses.length &&
    !!addressProvider &&
    !allAddresses.find((address) => address.publicKey === addressPublicKey) &&
    validFilterOptions.includes(addressProvider)

  useEffect(() => {
    if (
      accountFilter !== WalletMode.Default &&
      !filterOptions.includes(accountFilter)
    ) {
      setAccountFilter(WalletMode.Default)
    }
  }, [filterOptions, accountFilter])

  if (publicKeyToRemove) {
    return (
      <AccountRemoveModal
        align={align}
        onDelete={() => {
          remove(publicKeyToRemove)
          setPublicKeyToRemove("")
        }}
        onCancel={() => setPublicKeyToRemove("")}
        onBack={() => setPublicKeyToRemove("")}
      />
    )
  }

  const addNewAddress = (): void => {
    if (!canAdd) {
      return
    }

    add({
      address: searchPhrase,
      name: t("addressBook.defaultName"),
      provider: PROVIDERS_BY_WALLET_MODE[addressProvider][0],
      publicKey: addressPublicKey,
      isCustom: true,
    })

    setSearchPhrase("")

    if (accountFilter !== addressProvider) {
      setAccountFilter(WalletMode.Default)
    }
  }

  return (
    <>
      {header}
      <ModalBody sx={{ display: "flex", flexDirection: "column", gap: "xl" }}>
        <AddressBookSearch
          canAdd={canAdd}
          searchPhrase={searchPhrase}
          onSearchPhraseChange={setSearchPhrase}
          onAdd={addNewAddress}
        />
        {filterOptions.length > 1 && (
          <AccountFilter
            active={accountFilter}
            whitelist={filterOptions}
            blacklist={blacklist}
            onSetActive={setAccountFilter}
          />
        )}
        {searchedAddresses.length === 0 ? (
          <AddressBookEmptyState canAdd={canAdd} />
        ) : (
          <Flex direction="column" gap="base">
            {searchedAddresses.map((address) => (
              <Web3ConnectAccount
                key={address.publicKey}
                rawAddress={address.address}
                publicKey={address.publicKey}
                name={address.name}
                address={address.address}
                displayAddress={address.address}
                provider={address.provider}
                // TODO disable selecting
                {...(onSelect && { onSelect: () => onSelect(address) })}
                {...(address.isCustom && {
                  onEdit: (name: string) => {
                    edit({
                      ...address,
                      name,
                    })
                  },
                  onDelete: () => setPublicKeyToRemove(address.publicKey),
                })}
              />
            ))}
          </Flex>
        )}
      </ModalBody>
    </>
  )
}
