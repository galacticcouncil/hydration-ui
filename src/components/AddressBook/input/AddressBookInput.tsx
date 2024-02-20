import { useTranslation } from "react-i18next"
import { safeConvertAddressSS58 } from "utils/formatting"
import { useAddressStore } from "components/AddressBook/AddressBook.utils"
import { SButton, SContainer, SIcon, SInput } from "./AddressBookInput.styled"
import { safeConvertAddressH160 } from "utils/evm"

type Props = {
  search: string
  onChange: (search: string) => void
  onAdd: () => void
  canAdd: boolean
}

export const AddressBookInput = ({
  search,
  onChange,
  onAdd,
  canAdd,
}: Props) => {
  const { t } = useTranslation()
  const { add } = useAddressStore()

  const onSubmit = () => {
    const isValidAddress =
      safeConvertAddressSS58(search, 0) !== null ||
      safeConvertAddressH160(search) !== null

    if (!isValidAddress) return

    const name = t("addressbook.add.name")
    const address = search
    const provider = "external"

    const convertedAddress =
      safeConvertAddressSS58(address, 0) ||
      safeConvertAddressH160(address) ||
      search

    add({ name, address: convertedAddress, provider })
    onAdd()
  }

  return (
    <SContainer>
      <SIcon />
      <SInput
        value={search}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("addressbook.input.placeholder")}
      />
      {canAdd && <SButton onClick={onSubmit}>{t("add")}</SButton>}
    </SContainer>
  )
}
