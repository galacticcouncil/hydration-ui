import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import IconEdit from "assets/icons/IconEdit.svg?react"
import IconRemove from "assets/icons/IconRemove.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { useState } from "react"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { isHydraAddress } from "utils/formatting"
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
import { H160, isEvmAccount, isEvmAddress } from "utils/evm"
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

  const encodedAddress =
    isEvmAddress(address) || isHydraAddress(address)
      ? address
      : encodeAddress(decodeAddress(address), HYDRA_ADDRESS_PREFIX)

  const addressDisplay = isEvmAccount(encodedAddress)
    ? H160.fromAccount(encodedAddress)
    : encodedAddress

  if (editting)
    return (
      <AddressBookItemEdit
        id={id}
        address={addressDisplay}
        name={name}
        provider={provider}
        onEdit={() => setEditting(false)}
      />
    )

  return (
    <>
      <SItem onClick={() => onSelect(addressDisplay)}>
        <SNameContainer>
          <AccountAvatar
            theme={isEvmAddress(addressDisplay) ? "metamask" : undefined}
            address={addressDisplay}
            size={30}
          />
          <SName>{name}</SName>
        </SNameContainer>
        <SAddressContainer>
          <SAddress>{addressDisplay}</SAddress>
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
