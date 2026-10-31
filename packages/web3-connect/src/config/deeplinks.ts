import {
  createQueryString,
  HYDRATION_CHAIN_KEY,
  isAndroid,
  isMobileDevice,
} from "@galacticcouncil/utils"

import { WalletProviderType } from "@/config/providers"

const HASH_ROUTING = import.meta.env.VITE_IPFS === "true"

const TARGET_URL = HASH_ROUTING
  ? `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "")}`
  : `${window.location.protocol}//${window.location.hostname}`
const TARGET_ROUTE_URL = HASH_ROUTING ? `${TARGET_URL}/#` : TARGET_URL

const ENCODED_TARGET_URL = encodeURIComponent(TARGET_URL)
const ENCODED_SOLANA_TARGET_URL = encodeXcmTargetUrl("solana", "sol")
const ENCODED_SUI_TARGET_URL = encodeXcmTargetUrl("sui", "sui")

type DeepLinkConfig = { android?: string; universal: string }

export const WALLET_DEEPLINKS: Partial<
  Record<WalletProviderType, DeepLinkConfig>
> = {
  [WalletProviderType.MetaMask]: {
    universal: `https://link.metamask.io/dapp/${TARGET_URL.replace(/^https?:\/\//, "")}`,
  },
  [WalletProviderType.NovaWallet]: {
    universal: `https://app.novawallet.io/open/dapp?url=${ENCODED_TARGET_URL}`,
  },
  [WalletProviderType.Phantom]: {
    android: `phantom://browse/${ENCODED_SOLANA_TARGET_URL}?ref=${ENCODED_TARGET_URL}`,
    universal: `https://phantom.app/ul/browse/${ENCODED_SOLANA_TARGET_URL}?ref=${ENCODED_TARGET_URL}`,
  },
  [WalletProviderType.PhantomSui]: {
    android: `phantom://browse/${ENCODED_SUI_TARGET_URL}?ref=${ENCODED_TARGET_URL}`,
    universal: `https://phantom.app/ul/browse/${ENCODED_SUI_TARGET_URL}?ref=${ENCODED_TARGET_URL}`,
  },
  [WalletProviderType.Solflare]: {
    android: `solflare://v1/browse/${ENCODED_SOLANA_TARGET_URL}?ref=${ENCODED_TARGET_URL}`,
    universal: `https://solflare.com/ul/v1/browse/${ENCODED_SOLANA_TARGET_URL}?ref=${ENCODED_TARGET_URL}`,
  },
  [WalletProviderType.TrustWalletSol]: {
    android: `trust://open_url?coin_id=501&url=${ENCODED_SOLANA_TARGET_URL}`,
    universal: `https://link.trustwallet.com/open_url?coin_id=501&url=${ENCODED_SOLANA_TARGET_URL}`,
  },
  [WalletProviderType.BackpackSol]: {
    universal: `https://backpack.app/ul/v1/browse/${ENCODED_SOLANA_TARGET_URL}?ref=${ENCODED_TARGET_URL}`,
  },
}

export const getWalletDeeplink = (provider: WalletProviderType) => {
  const config = WALLET_DEEPLINKS[provider]
  if (!config || !isMobileDevice()) return undefined
  return config.android && isAndroid() ? config.android : config.universal
}

function encodeXcmTargetUrl(srcChain: string, asset: string) {
  return encodeURIComponent(
    `${TARGET_ROUTE_URL}/cross-chain${createQueryString({
      srcChain,
      srcAsset: asset,
      destChain: HYDRATION_CHAIN_KEY,
      destAsset: asset,
    })}`,
  )
}
