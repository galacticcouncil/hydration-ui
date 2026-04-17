import { hydration } from "@galacticcouncil/descriptors"
import { ExternalLink, Text, TextProps } from "@galacticcouncil/ui/components"
import {
  HYDRATION_CHAIN_KEY,
  isSS58Address,
  safeConvertSS58toPublicKey,
  shorten,
  shortenAccountAddress,
  stringEquals,
  subscan,
} from "@galacticcouncil/utils"
import { useAddressStore } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { useQuery } from "@tanstack/react-query"
import { TypedApi } from "polkadot-api"

import { getIdentityQuery } from "@/utils/identity"

const MAX_DISPLAY_NAME_LENGTH = 15

export type AccountIdentityProps = TextProps & {
  papi: TypedApi<typeof hydration>
  address: string
  withSubscanLink?: boolean
}

export const AccountSubstrateIdentity: React.FC<AccountIdentityProps> = ({
  papi,
  address,
  withSubscanLink = true,
  ...props
}) => {
  const addresses = useAddressStore((state) => state.addresses)
  const addressBookName = addresses.find((a) =>
    stringEquals(a.publicKey, safeConvertSS58toPublicKey(address)),
  )?.name

  const { data: identity } = useQuery(
    getIdentityQuery(papi, !addressBookName ? address : ""),
  )

  const displayName = addressBookName
    ? shorten(addressBookName, MAX_DISPLAY_NAME_LENGTH)
    : identity?.display || shortenAccountAddress(address)

  return (
    <Text {...props}>
      {withSubscanLink ? (
        <ExternalLink
          href={subscan.account(HYDRATION_CHAIN_KEY, address)}
          underlined={false}
        >
          {displayName}
        </ExternalLink>
      ) : (
        displayName
      )}
    </Text>
  )
}

export const AccountAddressBookIdentity: React.FC<
  Omit<AccountIdentityProps, "papi">
> = ({ address, withSubscanLink = true, ...props }) => {
  const addresses = useAddressStore((state) => state.addresses)
  const addressBookName = addresses.find((a) =>
    stringEquals(a.address, address),
  )?.name

  const displayName = addressBookName
    ? shorten(addressBookName, MAX_DISPLAY_NAME_LENGTH)
    : shortenAccountAddress(address)

  return (
    <Text {...props}>
      {withSubscanLink ? (
        <ExternalLink
          href={subscan.account(HYDRATION_CHAIN_KEY, address)}
          underlined={false}
        >
          {displayName}
        </ExternalLink>
      ) : (
        displayName
      )}
    </Text>
  )
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
