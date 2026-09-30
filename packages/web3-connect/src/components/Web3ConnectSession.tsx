import { useWalletSubscriptions } from "@/hooks/useWalletSubscriptions"
import { useWeb3EagerEnable } from "@/hooks/useWeb3EagerEnable"

/**
 * Session-scoped wallet plumbing: reconnects wallets the user had connected,
 * and keeps the store in step with what the extensions report.
 *
 * Renders nothing, and must be mounted exactly once for the lifetime of the
 * app. `Web3ConnectModal` is mounted several times (globally and per
 * cross-chain modal), so it stays a pure view over the store; this is where
 * the lifetime actually is.
 */
export const Web3ConnectSession = () => {
  useWeb3EagerEnable()
  useWalletSubscriptions()

  return null
}
