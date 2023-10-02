import IconEnter from "assets/icons/IconEnter.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { useAddressStore } from "components/AddressBook/AddressBook.utils"
import { FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { SButton, SContainer, SInput } from "./AddressBookItemEdit.styled"

type Props = {
  name: string
  address: string
  provider: string
  onEdit: () => void
}

export const AddressBookItemEdit = ({
  name,
  address,
  provider,
  onEdit,
}: Props) => {
  const { t } = useTranslation()
  const [input, setInput] = useState(name)
  const { edit } = useAddressStore()

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input) return

    edit({ name: input, address, provider })
    onEdit()
  }

  return (
    <SContainer onSubmit={onSubmit}>
      <AccountAvatar address={address} size={30} />
      <SInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      {!!input && (
        <SButton type="submit">
          {t("save")}
          <IconEnter />
        </SButton>
      )}
    </SContainer>
  )
}
