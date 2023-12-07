import { InjectedWindowProvider } from "@polkadot/extension-inject/types"
import BN from "bignumber.js"

import { MetaMaskProvider } from "utils/metamask"

declare module "@polkadot/types-codec/abstract" {
  class AbstractInt {
    toBigNumber(): BN
  }
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider
    injectedWeb3?: Record<string, InjectedWindowProvider>
    walletExtension?: { isNovaWallet?: boolean }
  }
}
