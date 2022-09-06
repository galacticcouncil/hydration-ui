import "interfaces/augment-api"
import { InjectedWindowProvider } from "@polkadot/extension-inject/types"

declare global {
  interface Window {
    injectedWeb3?: Record<string, InjectedWindowProvider>
  }
}
