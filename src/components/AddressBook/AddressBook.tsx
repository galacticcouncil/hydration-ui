import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { SContainer, SHeader, SItems } from "./AddressBook.styled"
import {
  getBlacklistedWallets,
  useAddressStore,
  validateAddress,
} from "./AddressBook.utils"
import { AddressBookEmpty } from "./empty/AddressBookEmpty"
import { AddressBookInput } from "./input/AddressBookInput"
import { AddressBookItem } from "./item/AddressBookItem"
import { arraySearch } from "utils/helpers"
import { Web3ConnectModeFilter } from "sections/web3-connect/modal/Web3ConnectModeFilter"
import {
  PROVIDERS_BY_WALLET_MODE,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { ModalScrollableContent } from "components/Modal/Modal"

type AddressBookProps = {
  onSelect: (address: string) => void
  mode?: WalletMode
}

export const AddressBook = ({
  onSelect,
  mode = WalletMode.Default,
}: AddressBookProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const { addresses: allAddresses } = useAddressStore()

  const [filter, setFilter] = useState(mode)

  const addresses = useMemo(() => {
    const validProviders = PROVIDERS_BY_WALLET_MODE[filter]

    return allAddresses.filter((address) =>
      validProviders.includes(address.provider),
    )
  }, [allAddresses, filter])

  const items = useMemo(
    () => (search ? arraySearch(addresses, search) : addresses),
    [addresses, search],
  )

  const addressProvider = validateAddress(search)

  const canAdd = !items.length && !!addressProvider

  return (
    <SContainer>
      <AddressBookInput
        search={search}
        onChange={setSearch}
        onAdd={() => setSearch("")}
        canAdd={canAdd}
      />
      <Web3ConnectModeFilter
        blacklist={getBlacklistedWallets(mode)}
        active={filter}
        onSetActive={(mode) => setFilter(mode)}
        sx={{ py: 14 }}
      />
      {!items.length ? (
        <AddressBookEmpty canAdd={canAdd} />
      ) : (
        <SItems>
          <SHeader>
            <Text fs={11} lh={16} color="basic700">
              {t("addressbook.list.account")}
            </Text>
            <Text fs={11} lh={16} color="basic700">
              {t("addressbook.list.address")}
            </Text>
          </SHeader>
          <ModalScrollableContent
            sx={{
              maxHeight: ["100%", "min(calc(90vh - 300px), 600px)"],
              pr: 0,
              width: "100%",
            }}
            content={items.map((address) => (
              <AddressBookItem
                key={address.address}
                {...address}
                onSelect={onSelect}
              />
            ))}
          />
        </SItems>
      )}
    </SContainer>
  )
}
