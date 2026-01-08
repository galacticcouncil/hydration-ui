import { Flex, ModalBody } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import {
  getWalletModeByAddress,
  PROVIDERS_BY_WALLET_MODE,
  WalletMode,
  Web3ConnectAccount,
} from "@galacticcouncil/web3-connect"
import { FC, useEffect, useState } from "react"

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
  const [publicKeyToRemove, setPublicKeyToRemove] = useState("")
  const [searchPhrase, setSearchPhrase] = useState("")

  const [filter, setFilter] = useState<AccountFilterOption>(
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

  const validProviders = PROVIDERS_BY_WALLET_MODE[filter]

  const filteredAddresses = allAddresses.filter((address) =>
    validProviders.includes(address.provider),
  )

  const searchedAddresses = filteredAddresses.filter(
    (address) =>
      address.name.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      address.address.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      address.publicKey.toLowerCase().includes(searchPhrase.toLowerCase()),
  )

  const addressProvider = getWalletModeByAddress(searchPhrase)
  const addressPublicKey = safeConvertSS58toPublicKey(searchPhrase)
  const canAdd =
    !searchedAddresses.length &&
    !!addressProvider &&
    !allAddresses.find((address) => address.publicKey === addressPublicKey) &&
    validFilterOptions.includes(addressProvider)

  useEffect(() => {
    if (filter !== WalletMode.Default && !filterOptions.includes(filter)) {
      setFilter(WalletMode.Default)
    }
  }, [filterOptions, filter])

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
      name: "My Account",
      provider: PROVIDERS_BY_WALLET_MODE[addressProvider][0],
      publicKey: addressPublicKey,
      isCustom: true,
    })

    setSearchPhrase("")

    if (filter !== addressProvider) {
      setFilter(WalletMode.Default)
    }
  }

  return (
    <>
      {header}
      <ModalBody sx={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <AddressBookSearch
          canAdd={canAdd}
          searchPhrase={searchPhrase}
          onSearchPhraseChange={setSearchPhrase}
          onAdd={addNewAddress}
        />
        {filterOptions.length > 1 && (
          <AccountFilter
            active={filter}
            whitelist={filterOptions}
            blacklist={blacklist}
            onSetActive={setFilter}
          />
        )}
        {searchedAddresses.length === 0 ? (
          <AddressBookEmptyState canAdd={canAdd} />
        ) : (
          <Flex direction="column" gap={10}>
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
