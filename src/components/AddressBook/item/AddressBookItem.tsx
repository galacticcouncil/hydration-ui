import IconEdit from "assets/icons/IconEdit.svg?react"
import IconRemove from "assets/icons/IconRemove.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { useState } from "react"

import {
  SAddress,
  SAddressContainer,
  SButton,
  SItem,
  SName,
  SNameContainer,
} from "./AddressBookItem.styled"
import { AddressBookItemEdit } from "./edit/AddressBookItemEdit"
import { AddressBookItemRemove } from "./remove/AddressBookItemRemove"
import { isEvmAddress } from "utils/evm"
import { Address } from "components/AddressBook/AddressBook.utils"

type Props = Address & {
  onSelect: (address: string) => void
}

export const AddressBookItem = ({
  address,
  name,
  provider,
  onSelect,
  id,
}: Props) => {
  const [editting, setEditting] = useState(false)
  const [removing, setRemoving] = useState(false)

  if (editting)
    return (
      <AddressBookItemEdit
        id={id}
        address={address}
        name={name}
        provider={provider}
        onEdit={() => setEditting(false)}
      />
    )

  return (
    <>
      <SItem onClick={() => onSelect(address)}>
        <SNameContainer>
          <AccountAvatar
            theme={isEvmAddress(address) ? "metamask" : undefined}
            address={address}
            size={30}
          />
          <SName>{name}</SName>
        </SNameContainer>
        <SAddressContainer>
          <SAddress>{address}</SAddress>
          {provider === "external" && (
            <div sx={{ flex: "row" }}>
              <SButton
                onClick={(e) => {
                  e.stopPropagation()
                  setRemoving(true)
                }}
              >
                <IconRemove />
              </SButton>
              <SButton
                onClick={(e) => {
                  e.stopPropagation()
                  setEditting(true)
                }}
              >
                <IconEdit />
              </SButton>
            </div>
          )}
        </SAddressContainer>
      </SItem>
      {id && removing && (
        <AddressBookItemRemove id={id} onDone={() => setRemoving(false)} />
      )}
    </>
  )
}
