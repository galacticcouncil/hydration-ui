import "interfaces/augment-api"
import { InjectedWindowProvider } from "@polkadot/extension-inject/types"
import BN from "bignumber.js"

declare module "@polkadot/types-codec/abstract" {
  class AbstractInt {
    toBigNumber(): BN
  }
}

declare global {
  interface Window {
    injectedWeb3?: Record<string, InjectedWindowProvider>
    walletExtension?: { isNovaWallet?: boolean }
  }
}
