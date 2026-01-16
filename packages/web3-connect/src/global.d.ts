import { EIP1193Provider } from "viem"

import { SolanaInjectedWindowProvider } from "@/types/solana"

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
    braveSolana?: SolanaInjectedWindowProvider
    injectedWeb3?: InjectedWeb3
    walletExtension?: { isNovaWallet?: boolean }
  }
}
