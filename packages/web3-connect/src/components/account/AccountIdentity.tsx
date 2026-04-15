import { hydration } from "@galacticcouncil/descriptors"
import { Text, TextProps } from "@galacticcouncil/ui/components"
import {
  isSS58Address,
  safeConvertSS58toPublicKey,
  shortenAccountAddress,
  stringEquals,
} from "@galacticcouncil/utils"
import { useAddressStore } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { useQuery } from "@tanstack/react-query"
import { TypedApi } from "polkadot-api"

import { getIdentityQuery } from "@/utils/identity"

export type AccountIdentityProps = TextProps & {
  papi: TypedApi<typeof hydration>
  address: string
}

export const AccountSubstrateIdentity: React.FC<AccountIdentityProps> = ({
  papi,
  address,
  ...props
}) => {
  const addresses = useAddressStore((state) => state.addresses)
  const addressBookName = addresses.find((a) =>
    stringEquals(a.publicKey, safeConvertSS58toPublicKey(address)),
  )?.name

  const { data: identity } = useQuery(
    getIdentityQuery(papi, !addressBookName ? address : ""),
  )

  const displayName =
    addressBookName || identity?.display || shortenAccountAddress(address)

  return <Text {...props}>{displayName}</Text>
}

export const AccountAddressBookIdentity: React.FC<
  Omit<AccountIdentityProps, "papi">
> = ({ address, ...props }) => {
  const addresses = useAddressStore((state) => state.addresses)
  const addressBookName = addresses.find((a) =>
    stringEquals(a.address, address),
  )?.name

  const displayName = addressBookName || shortenAccountAddress(address)

  return <Text {...props}>{displayName}</Text>
}

export const AccountIdentity: React.FC<AccountIdentityProps> = ({
  papi,
  ...props
}) => {
  if (isSS58Address(props.address)) {
    return <AccountSubstrateIdentity papi={papi} {...props} />
  }
  return <AccountAddressBookIdentity {...props} />
}
