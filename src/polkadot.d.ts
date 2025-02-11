import { InjectedWindowProvider } from "@polkadot/extension-inject/types"
import { MetaMaskLikeProvider } from "utils/metamask"
import { SolanaWalletProvider } from "utils/solana"

import BigNumber from "bignumber.js"

declare module "@polkadot/types" {
  interface Int {
    toBigNumber(): BigNumber
  }

  interface UInt {
    toBigNumber(): BigNumber
  }
}

declare global {
  interface Window {
    ethereum?: MetaMaskLikeProvider
    talismanEth?: MetaMaskLikeProvider
    SubWallet?: MetaMaskLikeProvider
    phantom?: {
      ethereum: MetaMaskLikeProvider
      solana: SolanaWalletProvider
    }
    braveSolana?: SolanaWalletProvider
    solflare?: SolanaWalletProvider
    injectedWeb3?: Record<string, InjectedWindowProvider>
    walletExtension?: { isNovaWallet?: boolean }
  }
}
