import { chainsMap } from "@galacticcouncil/xc-cfg"
import { SolanaChain } from "@galacticcouncil/xc-core"

export const SOLANA_RPC_PROXY_PATH = "/solana-rpc"

const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1"]

/**
 * The Solana RPC endpoint authorizes requests by Origin whitelist
 * (app.hydration.net), so direct requests from localhost fail with 401.
 * When running locally, route Solana RPC traffic through the Vite dev
 * server proxy (see vite.config.ts), which forwards requests with a
 * whitelisted Origin header.
 */
export const setupLocalSolanaRpcProxy = () => {
  if (!LOCAL_HOSTNAMES.includes(window.location.hostname)) return

  const solana = chainsMap.get("solana")
  if (!(solana instanceof SolanaChain)) return

  const { protocol, host } = window.location
  const wsProtocol = protocol === "https:" ? "wss:" : "ws:"

  // @ts-expect-error - mutating readonly property
  solana.rpcUrls = {
    http: [`${protocol}//${host}${SOLANA_RPC_PROXY_PATH}`],
    webSocket: [`${wsProtocol}//${host}${SOLANA_RPC_PROXY_PATH}`],
  }
}
