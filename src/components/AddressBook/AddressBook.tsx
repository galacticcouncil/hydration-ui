import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { safeConvertAddressSS58 } from "utils/formatting"
import { SContainer, SHeader, SItems } from "./AddressBook.styled"
import { useWalletAddresses } from "./AddressBook.utils"
import { AddressBookEmpty } from "./empty/AddressBookEmpty"
import { AddressBookInput } from "./input/AddressBookInput"
import { AddressBookItem } from "./item/AddressBookItem"

type Props = { onSelect: (address: string) => void }

export const AddressBook = ({ onSelect }: Props) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const addresses = useWalletAddresses()

  const items = useMemo(() => {
    const str = search.trim().toLowerCase()
    return addresses.data.filter((address) => {
      const name = address.name.trim().toLowerCase()
      const addr = address.address.trim().toLowerCase()
      return name.includes(str) || addr.includes(str)
    })
  }, [addresses.data, search])

  const canAdd =
    !!search && !items.length && safeConvertAddressSS58(search, 0) !== null

  return (
    <SContainer>
      <AddressBookInput
        search={search}
        onChange={setSearch}
        onAdd={() => setSearch("")}
        canAdd={canAdd}
      />
      <Spacer size={14} />
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
          {items.map((address) => (
            <AddressBookItem
              key={address.address}
              {...address}
              onSelect={onSelect}
            />
          ))}
        </SItems>
      )}
    </SContainer>
  )
}
