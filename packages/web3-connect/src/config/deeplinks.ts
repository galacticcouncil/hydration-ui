import { createQueryString, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"

import { WalletProviderType } from "@/config/providers"

const TARGET_HOSTNAME = window.location.hostname
const TARGET_URL = `${window.location.protocol}//${TARGET_HOSTNAME}`

const ENCODED_TARGET_URL = encodeURIComponent(TARGET_URL)
const ENCODED_SOLANA_TARGET_URL = encodeXcmTargetUrl("solana", "sol")
const ENCODED_SUI_TARGET_URL = encodeXcmTargetUrl("sui", "sui")

type DeepLinkConfig = { android?: string; universal: string }

export const WALLET_DEEPLINKS: Partial<
  Record<WalletProviderType, DeepLinkConfig>
> = {
  [WalletProviderType.MetaMask]: {
    universal: `https://link.metamask.io/dapp/${TARGET_HOSTNAME}`,
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
}

function encodeXcmTargetUrl(srcChain: string, asset: string) {
  return encodeURIComponent(
    `${TARGET_URL}/cross-chain${createQueryString({
      srcChain,
      srcAsset: asset,
      destChain: HYDRATION_CHAIN_KEY,
      destAsset: asset,
    })}`,
  )
}
