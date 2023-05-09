import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { ReactComponent as IconEdit } from "assets/icons/IconEdit.svg"
import { ReactComponent as IconRemove } from "assets/icons/IconRemove.svg"
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

type Props = {
  address: string
  name: string
  provider: string
  onSelect: (address: string) => void
}

export const AddressBookItem = ({
  address,
  name,
  provider,
  onSelect,
}: Props) => {
  const [editting, setEditting] = useState(false)
  const [removing, setRemoving] = useState(false)

  const hydraAddress = isHydraAddress(address)
    ? address
    : encodeAddress(decodeAddress(address), HYDRA_ADDRESS_PREFIX)

  if (editting)
    return (
      <AddressBookItemEdit
        address={hydraAddress}
        name={name}
        provider={provider}
        onEdit={() => setEditting(false)}
      />
    )

  return (
    <>
      <SItem onClick={() => onSelect(hydraAddress)}>
        <SNameContainer>
          <AccountAvatar address={hydraAddress} size={30} />
          <SName>{name}</SName>
        </SNameContainer>
        <SAddressContainer>
          <SAddress>{hydraAddress}</SAddress>
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
      {removing && (
        <AddressBookItemRemove
          address={hydraAddress}
          onDone={() => setRemoving(false)}
        />
      )}
    </>
  )
}
