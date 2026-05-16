// Vendored verbatim from upstream
// `packages/common/src/waku/waku-healthcheck.ts`.
import { BroadcasterConfig } from "../models/broadcaster-config.js"
import { WakuObservers } from "./waku-observers.js"
import { isDefined } from "../utils/is-defined.js"

type HealthcheckConnection = {
  remotePeer?:
    | {
        toString?: () => string
      }
    | string
}

type HealthcheckPeer = {
  id?:
    | {
        toString?: () => string
      }
    | string
  protocols?: string[]
  tags?: Map<string, unknown>
}

const formatConnectionPeerId = (connection: HealthcheckConnection): string => {
  const peer = connection.remotePeer
  if (typeof peer === "string") {
    return peer
  }
  if (peer && typeof peer.toString === "function") {
    return peer.toString()
  }
  return "unknown-peer"
}

const formatPeerId = (peer: HealthcheckPeer): string => {
  const peerId = peer.id
  if (typeof peerId === "string") {
    return peerId
  }
  if (peerId && typeof peerId.toString === "function") {
    return peerId.toString()
  }
  return "unknown-peer"
}

const hasPeerExchangeProtocol = (protocols?: string[]): boolean =>
  (protocols ?? []).includes("/vac/waku/peer-exchange/2.0.0-alpha1")

export const getWakuHealthSnapshot = async (options: {
  hasError: boolean
  peerDiscoveryTimeout: number
  restartCount: number
  waku?: {
    isStarted?: () => boolean
    libp2p?: {
      getConnections?: () => HealthcheckConnection[]
      peerStore?: {
        all?: () => Promise<HealthcheckPeer[]>
      }
    }
  }
}) => {
  const connections = options.waku?.libp2p?.getConnections?.() ?? []
  const connectedPeerIds = new Set(
    connections.map((connection) => formatConnectionPeerId(connection)),
  )
  const peerStore = options.waku?.libp2p?.peerStore
  const storedPeers: HealthcheckPeer[] = peerStore?.all
    ? await peerStore.all().catch(() => [])
    : []

  const bootstrapPeerIds: string[] = []
  const peerExchangePeerIds: string[] = []
  const connectedPeerDetails: {
    peerId: string
    supportsPeerExchange: boolean
    protocols: string[]
    tags: string[]
  }[] = []

  for (const peer of storedPeers) {
    const peerId = formatPeerId(peer)
    const tags = Array.from(peer.tags?.keys?.() ?? [])
    const protocols = peer.protocols ?? []

    if (tags.includes("bootstrap")) {
      bootstrapPeerIds.push(peerId)
    }
    if (tags.includes("peer-exchange")) {
      peerExchangePeerIds.push(peerId)
    }
    if (connectedPeerIds.has(peerId)) {
      connectedPeerDetails.push({
        peerId,
        supportsPeerExchange: hasPeerExchangeProtocol(protocols),
        protocols,
        tags,
      })
    }
  }

  return {
    hasWaku: isDefined(options.waku),
    isStarted: options.waku?.isStarted?.() ?? false,
    hasError: options.hasError,
    restartCount: options.restartCount,
    peerDiscoveryTimeout: options.peerDiscoveryTimeout,
    routing: BroadcasterConfig.getWakuRoutingInfo(),
    networkConfig: BroadcasterConfig.getWakuNetworkConfig(),
    configuredPeers: {
      useDNSDiscovery: BroadcasterConfig.useDNSDiscovery,
      dnsDiscoveryUrls: BroadcasterConfig.customDNS?.enrTreePeers ?? [],
      bootstrapPeers: BroadcasterConfig.additionalDirectPeers,
      storePeers: BroadcasterConfig.storePeers,
    },
    connections: {
      count: connections.length,
      peers: connections.map((connection) => formatConnectionPeerId(connection)),
    },
    discovery: {
      connectedPeerDetails,
      peerStore: {
        count: storedPeers.length,
        bootstrapCount: bootstrapPeerIds.length,
        peerExchangeCount: peerExchangePeerIds.length,
        bootstrapPeers: bootstrapPeerIds,
        peerExchangePeers: peerExchangePeerIds,
        connectedPeersSupportingPeerExchange: connectedPeerDetails
          .filter((peer) => peer.supportsPeerExchange)
          .map((peer) => peer.peerId),
      },
    },
    contentTopics: WakuObservers.getCurrentContentTopics(),
  }
}
