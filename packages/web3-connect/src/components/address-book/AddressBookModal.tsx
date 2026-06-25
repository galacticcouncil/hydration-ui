import {
  ModalBody,
  ModalHeader,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { filter, pipe, sortBy } from "remeda"

import { AccountFilter } from "@/components/account/AccountFilter"
import { AccountRemoveModal } from "@/components/account/AccountRemoveModal"
import {
  Address,
  useAddresses,
  useAddressStore,
} from "@/components/address-book/AddressBook.store"
import {
  AddressBookEmptyState,
  AddressBookEmptyStateReason,
} from "@/components/address-book/AddressBookEmptyState"
import { AddressBookEntry } from "@/components/address-book/AddressBookEntry"
import { AddressBookSearch } from "@/components/address-book/AddressBookSearch"
import {
  WALLET_ACCOUNT_FILTER_OPTIONS,
  WalletAccountFilterOption,
  WalletAccountFilterOptionOverride,
  WalletMode,
} from "@/config/wallet"
import i18n from "@/i18n"
import { addressToPublicKey } from "@/utils/publicKey"
import { getWalletModeByAddress, getWalletModeName } from "@/utils/wallet"

type Props = {
  readonly header?: React.ReactNode
  readonly onBack?: () => void
  readonly align?: "default" | "center"
  readonly whitelist?: ReadonlyArray<WalletAccountFilterOptionOverride>
  readonly onSelect?: (address: Address) => void
}

const ADDRESS_BOOK_ENTRY_HEIGHT = 48
const MAX_VISIBLE_ADDRESS_BOOK_ENTRIES = 6

export const AddressBookModal: FC<Props> = ({
  header,
  onBack,
  align = "default",
  whitelist = WALLET_ACCOUNT_FILTER_OPTIONS,
  onSelect,
}) => {
  const { t } = useTranslation("translations", { i18n })
  const [publicKeyToRemove, setPublicKeyToRemove] = useState("")
  const [searchPhrase, setSearchPhrase] = useState("")

  const [accountFilter, setAccountFilter] = useState<WalletAccountFilterOption>(
    whitelist.length === 1
      ? (whitelist[0] ?? WalletMode.Default)
      : WalletMode.Default,
  )

  const { add, edit, remove } = useAddressStore()
  const allAddresses = useAddresses()

  const addressOrder = new Map(
    allAddresses.map((address, index) => [address.publicKey, index]),
  )

  const filteredAddresses = pipe(
    allAddresses,
    filter((address) =>
      accountFilter === WalletMode.Default
        ? whitelist.includes(address.mode)
        : address.mode === accountFilter,
    ),
    sortBy(
      [(address) => address.isCustom || false, "desc"],
      [(address) => addressOrder.get(address.publicKey) ?? 0, "desc"],
    ),
  )

  const searchedAddresses = filteredAddresses.filter(
    (address) =>
      address.name.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      address.address.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      address.publicKey.toLowerCase().includes(searchPhrase.toLowerCase()),
  )

  const addressProvider = getWalletModeByAddress(searchPhrase)
  const addressPublicKey = addressToPublicKey(searchPhrase)

  const canAdd =
    !searchedAddresses.length &&
    !!addressProvider &&
    !allAddresses.find((address) => address.publicKey === addressPublicKey) &&
    whitelist.includes(addressProvider)

  const emptyStateReason = ((): AddressBookEmptyStateReason => {
    const hasSearch = searchPhrase.trim().length > 0

    if (hasSearch) {
      return canAdd
        ? AddressBookEmptyStateReason.SearchNotInList
        : AddressBookEmptyStateReason.SearchNoResults
    }

    if (allAddresses.length === 0) {
      return AddressBookEmptyStateReason.NoContacts
    }

    return AddressBookEmptyStateReason.NoFilterContacts
  })()

  const emptyStateFilterName =
    accountFilter !== WalletMode.Default
      ? getWalletModeName(accountFilter)
      : undefined

  const selectTitle =
    accountFilter === WalletMode.Default
      ? t("addressBook.selectAccount")
      : t("addressBook.selectModeAccount", {
          mode: getWalletModeName(accountFilter),
        })

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
      name: "",
      isCustom: true,
    })

    setSearchPhrase("")

    if (accountFilter !== addressProvider) {
      setAccountFilter(WalletMode.Default)
    }
  }

  return (
    <>
      {header ??
        (onBack && (
          <ModalHeader title={selectTitle} align={align} onBack={onBack} />
        ))}
      <ModalBody
        scrollable={false}
        sx={{ display: "flex", flexDirection: "column", gap: "xl" }}
      >
        <AddressBookSearch
          canAdd={canAdd}
          searchPhrase={searchPhrase}
          onSearchPhraseChange={setSearchPhrase}
          onAdd={addNewAddress}
        />
        {whitelist.length > 1 && (
          <AccountFilter
            active={accountFilter}
            whitelist={whitelist}
            onSetActive={setAccountFilter}
          />
        )}
      </ModalBody>
      <ModalBody scrollable={false} noPadding>
        {searchedAddresses.length === 0 ? (
          <AddressBookEmptyState
            reason={emptyStateReason}
            filterName={emptyStateFilterName}
            {...(canAdd && {
              address: searchPhrase,
              addressMode: addressProvider,
              onAdd: addNewAddress,
            })}
          />
        ) : (
          <VirtualizedList
            items={searchedAddresses}
            itemSize={ADDRESS_BOOK_ENTRY_HEIGHT}
            maxVisibleItems={MAX_VISIBLE_ADDRESS_BOOK_ENTRIES}
            separated
            getItemKey={(index) => searchedAddresses[index]?.publicKey ?? index}
            renderItem={(address) => (
              <AddressBookEntry
                key={address.publicKey}
                address={address.address}
                mode={address.mode}
                name={address.name}
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
            )}
          />
        )}
      </ModalBody>
    </>
  )
}
