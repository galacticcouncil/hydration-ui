import { isH160Address } from "@galacticcouncil/utils"
import { lazy, Suspense } from "react"

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

export type AccountAvatarTheme = "auto" | "polkadot" | "evm" | "talisman"
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
      {chosenTheme === "evm" && <EthereumIdenticon size={size} {...props} />}
      {chosenTheme === "talisman" && (
        <TalismanIdenticon size={size} {...props} />
      )}
      {chosenTheme === "polkadot" && (
        <PolkadotIdenticon size={size} {...props} />
      )}
    </Suspense>
  )
}

function getAutoTheme(address: string): AccountAvatarTheme {
  return isH160Address(address) ? "evm" : "polkadot"
}
