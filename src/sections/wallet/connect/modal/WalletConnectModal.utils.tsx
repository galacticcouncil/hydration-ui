import { ReactNode } from "react"
import { ReactComponent as PolkadotLogo } from "assets/icons/PolkadotLogo.svg"
import { ReactComponent as TalismanLogo } from "assets/icons/TalismanLogo.svg"

export const PROVIDERS = ["polkadot-js", "talisman"] as const
export type ProviderType = typeof PROVIDERS[number]

export const PROVIDER_DOWNLOAD_URLS: Record<ProviderType, string> = {
  "polkadot-js": "https://polkadot.js.org/extension/",
  talisman: "https://talisman.xyz/",
}

export function getProviderMeta(
  provider: ProviderType,
  options: { size: number },
) {
  let name: string | null = null
  let logo: ReactNode | null = null
  if (provider === "polkadot-js") {
    name = "Polkadot"
    logo = (
      <PolkadotLogo width={options.size ?? 48} height={options.size ?? 48} />
    )
  } else if (provider === "talisman") {
    name = "Talisman"
    logo = (
      <TalismanLogo width={options.size ?? 48} height={options.size ?? 48} />
    )
  }

  return { name, logo }
}
