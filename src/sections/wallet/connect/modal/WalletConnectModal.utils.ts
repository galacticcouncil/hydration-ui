export const PROVIDERS = ["polkadot-js", "talisman"] as const
export type ProviderType = typeof PROVIDERS[number]

export const PROVIDER_DOWNLOAD_URLS: Record<ProviderType, string> = {
  "polkadot-js": "https://polkadot.js.org/extension/",
  talisman: "https://talisman.xyz/",
}
