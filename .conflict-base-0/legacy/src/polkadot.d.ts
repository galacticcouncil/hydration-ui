import { InjectedWindowProvider } from "@polkadot/extension-inject/types"
import { MetaMaskLikeProvider } from "utils/metamask"

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
    }
    injectedWeb3?: Record<string, InjectedWindowProvider>
    walletExtension?: { isNovaWallet?: boolean }
  }
}
