import {
  HYDRATION_CHAIN_KEY,
  isEvmParachain,
  isH160Address,
  isParachain,
} from "@galacticcouncil/utils"
import {
  Account,
  PROVIDERS_BY_WALLET_MODE,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import {
  EVM_PROVIDERS,
  SOLANA_PROVIDERS,
  SUBSTRATE_H160_PROVIDERS,
  SUBSTRATE_PROVIDERS,
  SUI_PROVIDERS,
} from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AnyChain, Asset, ChainEcosystem } from "@galacticcouncil/xc-core"
import { filter, first, pipe, sortBy } from "remeda"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

const CHAINS_PRIORITY = [
  HYDRATION_CHAIN_KEY,
  "ethereum",
  "solana",
  "sui",
  "assethub",
  "moonbeam",
  "assethub_kusama",
]
const CHAINS_BLACKLIST = ["polkadot"]

export const getChainPriority = (key: string) => {
  const idx = CHAINS_PRIORITY.indexOf(key)
  return idx === -1 ? Number.POSITIVE_INFINITY : idx
}

export const XCM_CHAINS = pipe(
  [...chainsMap.values()],
  filter((c) => {
    if (c.isTestChain) return false
    if (CHAINS_BLACKLIST.includes(c.key)) return false
    return (
      (c.ecosystem === ChainEcosystem.Kusama && c.key === "assethub_kusama") ||
      c.ecosystem === ChainEcosystem.Polkadot ||
      c.ecosystem === ChainEcosystem.Solana ||
      c.ecosystem === ChainEcosystem.Sui ||
      c.ecosystem === ChainEcosystem.Ethereum
    )
  }),
  sortBy((c) => [getChainPriority(c.key), c.name]),
)

export const getXcmFormDefaults = (account: Account | null): XcmFormValues => {
  const rawAddress = account?.rawAddress ?? ""
  const provider = account?.provider

  const srcChain: AnyChain | null = (() => {
    if (!provider) return chainsMap.get("assethub") || null
    switch (true) {
      case SUBSTRATE_H160_PROVIDERS.includes(provider) &&
        isH160Address(rawAddress):
        return chainsMap.get("mythos") || null
      case SUBSTRATE_PROVIDERS.includes(provider):
        return chainsMap.get("assethub") || null
      case EVM_PROVIDERS.includes(provider):
        return chainsMap.get("ethereum") || null
      case SOLANA_PROVIDERS.includes(provider):
        return chainsMap.get("solana") || null
      case SUI_PROVIDERS.includes(provider):
        return chainsMap.get("sui") || null
      default:
        return chainsMap.get("assethub") || null
    }
  })()

  const srcChainAssets = srcChain?.assetsData
    ? [...srcChain.assetsData.values()]
    : []

  const srcAsset: Asset | null = first(srcChainAssets)?.asset || null

  const destChain = chainsMap.get(HYDRATION_CHAIN_KEY) || null

  const destAccount =
    !!destChain && isAccountValidOnChain(account, destChain) ? account : null

  return {
    srcChain,
    srcAsset,
    srcAmount: "",
    destChain,
    destAsset: srcAsset,
    destAmount: "",
    destAddress: destAccount?.rawAddress ?? "",
    destAccount: destAccount,
  }
}

export const getWalletModeByChain = (chain: AnyChain) => {
  if (chain.key === HYDRATION_CHAIN_KEY) {
    return WalletMode.SubstrateEVM
  }

  if (isEvmParachain(chain)) {
    return chain.usesH160Acc ? WalletMode.EVM : WalletMode.Substrate
  }

  if (isParachain(chain)) {
    return chain.usesH160Acc ? WalletMode.SubstrateH160 : WalletMode.Substrate
  }

  if (chain.isEvmChain()) {
    return WalletMode.EVM
  }

  if (chain.isSolana()) {
    return WalletMode.Solana
  }

  if (chain.isSui()) {
    return WalletMode.Sui
  }

  return WalletMode.Default
}

export const isAccountValidOnChain = (
  account: Account | null,
  chain: AnyChain,
): account is Account => {
  if (!account) return false
  const walletMode = getWalletModeByChain(chain)

  return PROVIDERS_BY_WALLET_MODE[walletMode].includes(account.provider)
}
