import "@polkadot/api-augment"
import { InjectedWindowProvider } from "@polkadot/extension-inject/types"

declare global {
  interface Window {
    injectedWeb3?: Record<string, InjectedWindowProvider>
  }
}
