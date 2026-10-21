import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid"

const transports = new Map<boolean, WebSocketTransport>()

/**
 * One socket per network, shared by every subscriber. `resubscribe` puts the
 * streams back after a reconnect, which matters on a page that can sit open
 * for hours.
 */
export const getSubscriptionTransport = (isTestnet: boolean) => {
  const cached = transports.get(isTestnet)

  if (cached) return cached

  const transport = new WebSocketTransport({ isTestnet, resubscribe: true })
  transports.set(isTestnet, transport)

  return transport
}

export const getSubscriptionClient = (isTestnet: boolean) =>
  new SubscriptionClient({ transport: getSubscriptionTransport(isTestnet) })
