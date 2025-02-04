import { FC } from "react"
import { isHex, isU8a, u8aToHex } from "@polkadot/util"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { TalismanAvatar } from "components/AccountAvatar/TalismanAvatar"
import { safeConvertAddressSS58 } from "utils/formatting"
import { JdenticonAvatar } from "./JdenticonAvatar"
import { PolkadotAvatar } from "./PolkadotAvatar"
import { MetaMaskAvatar } from "./MetaMaskAvatar"
import { isEvmAccount, isEvmAddress, safeConvertAddressH160 } from "utils/evm"
import {
  SOLANA_PROVIDERS,
  WalletProviderType,
} from "sections/web3-connect/constants/providers"
import { genesisHashToChain } from "utils/helpers"
import type { Icon } from "@polkadot/networks/types"

type Props = {
  address: string
  size: number
  genesisHash?: `0x${string}`
  className?: string
  provider?: WalletProviderType | null
}

export const AccountAvatar: FC<Props> = (props) => {
  const chain = genesisHashToChain(props.genesisHash)
  const chainIcon: Icon =
    props.genesisHash && chain?.icon ? chain.icon : "polkadot"

  const isSolana = !!props.provider && SOLANA_PROVIDERS.includes(props.provider)
  const isEvm = isEvmAccount(props.address) || isEvmAddress(props.address)

  const theme = props.provider?.startsWith("talisman")
    ? "talisman"
    : isEvm
      ? "evm"
      : isSolana
        ? "jdenticon"
        : chainIcon

  if (theme === "jdenticon") {
    return (
      <JdenticonAvatar
        publicKey={props.address}
        size={props.size}
        className={props.className}
      />
    )
  }

  if (theme === "evm") {
    return (
      <MetaMaskAvatar
        address={safeConvertAddressH160(props.address) ?? props.address}
        size={props.size}
        className={props.className}
      />
    )
  }

  if (theme === "talisman") {
    return (
      <TalismanAvatar
        seed={safeConvertAddressH160(props.address) ?? props.address}
        size={props.size}
        className={props.className}
      />
    )
  }

  if (safeConvertAddressSS58(props.address, 0) === null) return null

  const address =
    isU8a(props.address) || isHex(props.address)
      ? encodeAddress(props.address, chain.prefix)
      : props.address || ""

  if (theme === "polkadot") {
    return (
      <PolkadotAvatar
        address={address}
        size={props.size}
        className={props.className}
      />
    )
  }

  const publicKey = u8aToHex(decodeAddress(address, false))

  return (
    <JdenticonAvatar
      publicKey={publicKey}
      size={props.size}
      className={props.className}
    />
  )
}
