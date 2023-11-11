import { isHex, isU8a, u8aToHex } from "@polkadot/util"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { TalismanAvatar } from "components/AccountAvatar/TalismanAvatar"
import { safeConvertAddressSS58 } from "utils/formatting"
import { JdenticonAvatar } from "./JdenticonAvatar"
import { PolkadotAvatar } from "./PolkadotAvatar"
import { MetaMaskAvatar } from "./MetaMaskAvatar"
import { isEvmAddress } from "utils/evm"

export function AccountAvatar(props: {
  address: string
  size: number
  theme?: string
  className?: string
  prefix?: number
}) {
  if (props.theme === "metamask" || isEvmAddress(props.address)) {
    return (
      <MetaMaskAvatar
        address={props.address}
        size={props.size}
        className={props.className}
      />
    )
  }

  if (safeConvertAddressSS58(props.address, 0) === null) return null

  const address =
    isU8a(props.address) || isHex(props.address)
      ? encodeAddress(props.address, props.prefix)
      : props.address || ""

  const publicKey = u8aToHex(decodeAddress(address, false, props.prefix))

  if (props.theme === "talisman") {
    return (
      <TalismanAvatar
        seed={address}
        size={props.size}
        className={props.className}
      />
    )
  }

  if (props.theme === "polkadot-js") {
    return (
      <PolkadotAvatar
        address={address}
        size={props.size}
        className={props.className}
      />
    )
  }

  return (
    <JdenticonAvatar
      publicKey={publicKey}
      size={props.size}
      className={props.className}
    />
  )
}
