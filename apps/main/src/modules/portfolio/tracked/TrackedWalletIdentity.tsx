import { Flex, Text, TextProps } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  isSS58Address,
  safeConvertSS58toPublicKey,
  shorten,
  shortenAccountAddress,
  stringEquals,
} from "@galacticcouncil/utils"
import { getIdentityQuery, useAddresses } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"

import { AccountIdentity } from "@/components/AccountIdentity"
import {
  TrackedWalletGlyph,
  useTrackedWalletAccent,
} from "@/modules/portfolio/tracked/TrackedWalletGlyph"
import { useRpcProvider } from "@/providers/rpcProvider"

const MAX_DISPLAY_NAME_LENGTH = 15

type Props = Omit<TextProps, "color"> & {
  readonly address: string
  readonly glyphSize?: number
  readonly iconSize?: number
}

const useAccountDisplayName = (address: string): string => {
  const { papi } = useRpcProvider()
  const addresses = useAddresses()
  const isSS58 = isSS58Address(address)

  const addressBookName = addresses.find((a) =>
    isSS58
      ? stringEquals(a.publicKey, safeConvertSS58toPublicKey(address))
      : stringEquals(a.address, address),
  )?.name

  const { data: identity } = useQuery(
    getIdentityQuery(papi, isSS58 && !addressBookName ? address : ""),
  )

  if (addressBookName) return shorten(addressBookName, MAX_DISPLAY_NAME_LENGTH)
  if (isSS58 && identity?.display) return identity.display
  return shortenAccountAddress(address)
}

export const TrackedWalletIdentity: FC<Props> = ({
  address,
  glyphSize = 20,
  iconSize = 10,
  ...textProps
}) => {
  const accent = useTrackedWalletAccent(address)
  const displayName = useAccountDisplayName(address)
  const shortAddress = shortenAccountAddress(address)
  const showAddress =
    displayName.replace(/\u2026|\.\.\./g, "") !==
    shortAddress.replace(/\u2026|\.\.\./g, "")

  return (
    <Flex align="center" gap="s" sx={{ minWidth: 0 }}>
      <TrackedWalletGlyph
        size={glyphSize}
        iconSize={iconSize}
        accent={accent}
      />
      <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
        <AccountIdentity
          address={address}
          withExplorerLink={false}
          color={accent.text}
          {...textProps}
        />
        {showAddress && (
          <>
            <Text fs={textProps.fs} fw={500} color={getToken("text.medium")}>
              ·
            </Text>
            <Text
              fs={textProps.fs}
              fw={500}
              color={getToken("text.medium")}
              sx={{ flexShrink: 0 }}
            >
              {shortAddress}
            </Text>
          </>
        )}
      </Flex>
    </Flex>
  )
}
