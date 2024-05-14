import { InjectedWindowProvider } from "@polkadot/extension-inject/types"
import BN from "bignumber.js"

import { MetaMaskLikeProvider } from "utils/metamask"

declare module "@polkadot/types-codec/abstract" {
  class AbstractInt {
    toBigNumber(): BN
  }
}

declare global {
  interface Window {
    ethereum?: MetaMaskLikeProvider
    talismanEth?: MetaMaskLikeProvider
    SubWallet?: MetaMaskLikeProvider
    injectedWeb3?: Record<string, InjectedWindowProvider>
    walletExtension?: { isNovaWallet?: boolean }
  }
}
