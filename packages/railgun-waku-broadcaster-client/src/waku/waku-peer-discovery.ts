// Vendored verbatim from upstream
// `packages/common/src/waku/waku-peer-discovery.ts`. shared-models import
// routed through the local shim.
import { isDefined } from "../shared-models-shim.js"
import type { CustomDNSConfig } from "../models/broadcaster-config.js"

type PeerStore = {
  all?: () => Promise<any[]>
}

type ConnectionManagerOptions = {
  connectionManager: {
    maxBootstrapPeers: number
    maxConnections: number
  }
}

type PeerExchangeDiscoveryConfig = {
  createPeerExchangeDiscovery: () => (components: any) => any
  getAdmittedPeerExchangePeerIds: () => Set<string>
  getKnownPeerIds?: (peerStore?: PeerStore) => Promise<Set<string>>
  getPeerInfoId: (peerInfo: any) => string
  mapNewPeerInfo?: (peerInfo: any) => any | undefined
  maxBootstrapPeers: number
  maxConnections: number
  onBeforeSelectPeerInfos?: () => void
  onPeerInfosSelected?: (peerInfos: any[]) => Promise<void> | void
  peerExchangeAttemptBuffer?: number
}

export const formatDiscoveryPeerId = (peerId: any): string =>
  peerId?.toString?.() ?? String(peerId ?? "unknown-peer")

export const getKnownPeerIds = async (
  peerStore?: PeerStore,
): Promise<Set<string>> => {
  if (!peerStore?.all) {
    return new Set()
  }

  const peers = await peerStore.all().catch(() => [])
  return new Set(peers.map((peer) => formatDiscoveryPeerId(peer.id)))
}

export const getDnsDiscoveryUrls = (
  enrTrees: {
    SANDBOX: string
    TEST: string
  },
  customDNS?: CustomDNSConfig,
): string[] => {
  const enrTreePeers: string[] = []
  if (isDefined(customDNS)) {
    enrTreePeers.push(...customDNS.enrTreePeers)
    if (!customDNS.onlyCustom) {
      enrTreePeers.push(...[enrTrees.SANDBOX, enrTrees.TEST])
    }
  }
  return enrTreePeers
}

export const getConnectionManagerOptions = (
  maxBootstrapPeers: number,
  maxConnections: number,
): ConnectionManagerOptions => ({
  connectionManager: {
    maxBootstrapPeers,
    maxConnections,
  },
})

export const createLoggedPeerExchangeDiscovery = ({
  createPeerExchangeDiscovery,
  getAdmittedPeerExchangePeerIds,
  getKnownPeerIds: getKnownPeerIdsImpl = getKnownPeerIds,
  getPeerInfoId,
  mapNewPeerInfo = (peerInfo) => peerInfo,
  maxBootstrapPeers,
  maxConnections,
  onBeforeSelectPeerInfos,
  onPeerInfosSelected,
  peerExchangeAttemptBuffer = 0,
}: PeerExchangeDiscoveryConfig) => {
  return (components: any) => {
    const discovery = createPeerExchangeDiscovery()(components) as any
    const originalQuery = discovery.query?.bind(discovery)
    if (typeof originalQuery !== "function") {
      return discovery
    }

    discovery.query = async (peerId: any) => {
      const knownBefore = await getKnownPeerIdsImpl(components?.peerStore)
      const originalPeerExchangeQuery = discovery.peerExchange?.query?.bind(
        discovery.peerExchange,
      )

      if (typeof originalPeerExchangeQuery === "function") {
        discovery.peerExchange.query = async (params: any) => {
          const result = await originalPeerExchangeQuery(params)
          const peerInfos = result?.peerInfos ?? []
          const knownBeforeLookup = new Set(knownBefore)
          const knownPeerInfos: any[] = []
          const candidateNewPeerInfos: any[] = []

          for (const peerInfo of peerInfos) {
            const discoveredPeerId = getPeerInfoId(peerInfo)
            if (knownBeforeLookup.has(discoveredPeerId)) {
              knownPeerInfos.push(peerInfo)
              continue
            }

            const mappedPeerInfo = mapNewPeerInfo(peerInfo)
            if (isDefined(mappedPeerInfo)) {
              candidateNewPeerInfos.push(mappedPeerInfo)
            }
          }

          onBeforeSelectPeerInfos?.()
          const admittedPeerExchangePeerIds = getAdmittedPeerExchangePeerIds()
          const availableSlots = Math.max(
            0,
            maxConnections -
              maxBootstrapPeers -
              admittedPeerExchangePeerIds.size,
          )
          const attemptWindow = Math.min(
            candidateNewPeerInfos.length,
            Math.max(availableSlots, 1) + peerExchangeAttemptBuffer,
          )
          const attemptNewPeerInfos = candidateNewPeerInfos.slice(
            0,
            attemptWindow,
          )
          const allowedNewPeerInfos: any[] = []

          for (const candidatePeerInfo of attemptNewPeerInfos) {
            if (allowedNewPeerInfos.length >= availableSlots) {
              break
            }

            const discoveredPeerId = getPeerInfoId(candidatePeerInfo)
            if (admittedPeerExchangePeerIds.has(discoveredPeerId)) {
              continue
            }

            admittedPeerExchangePeerIds.add(discoveredPeerId)
            allowedNewPeerInfos.push(candidatePeerInfo)
          }

          await onPeerInfosSelected?.(attemptNewPeerInfos)

          return {
            ...result,
            peerInfos: [...knownPeerInfos, ...allowedNewPeerInfos],
          }
        }
      }

      try {
        return await originalQuery(peerId)
      } finally {
        if (typeof originalPeerExchangeQuery === "function") {
          discovery.peerExchange.query = originalPeerExchangeQuery
        }
      }
    }

    return discovery
  }
}
