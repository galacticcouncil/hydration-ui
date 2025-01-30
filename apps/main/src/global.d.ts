import { InjectedWindowProvider as PolkadotInjectedWindowProvider } from "@polkadot/extension-inject/types"
import { EIP1193Provider } from "viem"

import { SolanaInjectedWindowProvider } from "@/utils/solana"

declare global {
  interface Window {
    ethereum?: EIP1193Provider
    talismanEth?: EIP1193Provider
    SubWallet?: EIP1193Provider
    phantom?: {
      ethereum: EIP1193Provider
      solana: SolanaInjectedWindowProvider
    }
    solflare?: SolanaInjectedWindowProvider
    injectedWeb3?: Record<string, PolkadotInjectedWindowProvider>
    walletExtension?: { isNovaWallet?: boolean }
  }
}
