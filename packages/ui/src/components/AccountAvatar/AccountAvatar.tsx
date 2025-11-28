import { EvmAddr, SolanaAddr, Ss58Addr, SuiAddr } from "@galacticcouncil/utils"
import { lazy, Suspense } from "react"

import { EmptyIdenticon } from "@/components/AccountAvatar/identicons/EmptyIdenticon"
import { SolanaIdenticon } from "@/components/AccountAvatar/identicons/SolanaIdenticon"
import { SuiIdenticon } from "@/components/AccountAvatar/identicons/SuiIdenticon"
import { Box, BoxProps } from "@/components/Box"
import { getToken } from "@/utils"

const PolkadotIdenticon = lazy(async () => ({
  default: await import(
    "@/components/AccountAvatar/identicons/PolkadotIdenticon"
  ).then((m) => m.PolkadotIdenticon),
}))

const TalismanIdenticon = lazy(async () => ({
  default: await import(
    "@/components/AccountAvatar/identicons/TalismanIdenticon"
  ).then((m) => m.TalismanIdenticon),
}))

const EthereumIdenticon = lazy(async () => ({
  default: await import(
    "@/components/AccountAvatar/identicons/EthereumIdenticon"
  ).then((m) => m.EthereumIdenticon),
}))

export type AccountAvatarTheme =
  | "auto"
  | "polkadot"
  | "evm"
  | "talisman"
  | "solana"
  | "sui"
export type AccountAvatarProps = BoxProps & {
  address: string
  size?: number
  theme?: AccountAvatarTheme
}

export const AccountAvatar: React.FC<AccountAvatarProps> = ({
  size = 32,
  theme = "auto",
  ...props
}) => {
  const chosenTheme = theme === "auto" ? getAutoTheme(props.address) : theme

  return (
    <Suspense
      fallback={
        <Box
          size={size}
          borderRadius="full"
          bg={getToken("surfaces.containers.dim.dimOnHigh")}
        />
      }
    >
      {chosenTheme === null && <EmptyIdenticon size={size} />}
      {chosenTheme === "evm" && <EthereumIdenticon size={size} {...props} />}
      {chosenTheme === "talisman" && (
        <TalismanIdenticon size={size} {...props} />
      )}
      {chosenTheme === "polkadot" && (
        <PolkadotIdenticon size={size} {...props} />
      )}
      {chosenTheme === "solana" && <SolanaIdenticon size={size} {...props} />}
      {chosenTheme === "sui" && <SuiIdenticon size={size} {...props} />}
    </Suspense>
  )
}

function getAutoTheme(address: string): AccountAvatarTheme | null {
  switch (true) {
    case EvmAddr.isValid(address):
      return "evm"
    case Ss58Addr.isValid(address):
      return "polkadot"
    case SolanaAddr.isValid(address):
      return "solana"
    case SuiAddr.isValid(address):
      return "sui"
    default:
      return null
  }
}
