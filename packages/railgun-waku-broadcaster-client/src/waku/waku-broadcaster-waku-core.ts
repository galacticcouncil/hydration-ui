// Vendored from upstream `packages/web/src/waku/waku-broadcaster-waku-core.ts`
// (browser build). We only ship the web flavor — there's no node-side caller
// in hydration-ui.
//
// shared-models import routes through the local shim.
import { createLightNode } from "@waku/sdk"
import { BroadcasterDebug } from "../utils/broadcaster-debug.js"
import {
  enrTree,
  wakuDnsDiscovery,
  wakuPeerExchangeDiscovery,
} from "@waku/discovery"
import { isDefined } from "../shared-models-shim.js"
import { WAKU_RAILGUN_DEFAULT_PEERS_WEB } from "../models/constants.js"
import { WakuBroadcasterPeerDiscoveryCoreBase } from "./waku-broadcaster-peer-discovery-core-base.js"

export class WakuBroadcasterWakuCore extends WakuBroadcasterPeerDiscoveryCoreBase {
  protected static createWakuNode = createLightNode
  protected static createDnsPeerDiscovery = wakuDnsDiscovery
  protected static createPeerExchangeDiscovery = wakuPeerExchangeDiscovery

  protected static getEnrTrees() {
    return enrTree
  }

  protected static getDefaultPeers(): string[] {
    return WAKU_RAILGUN_DEFAULT_PEERS_WEB
  }

  private static synthesizeWssMultiaddr(multiaddr: string): string | undefined {
    if (/\/wss(?:\/|$)/.test(multiaddr) || /\/ws(?:\/|$)/.test(multiaddr)) {
      return multiaddr
    }

    const webPortMatch = multiaddr.match(
      /^(\/dns(?:4|6)\/[^/]+\/tcp\/(?:8000|443))(\/p2p\/[^/]+)$/,
    )
    if (webPortMatch) {
      const [, base, peerSuffix] = webPortMatch
      return `${base}/wss${peerSuffix}`
    }

    return undefined
  }

  private static getPeerInfoWssMultiaddrs(peerInfo: any): string[] {
    return [
      ...new Set(
        this.getPeerInfoMultiaddrStrings(peerInfo)
          .map((multiaddr) => this.synthesizeWssMultiaddr(multiaddr))
          .filter(isDefined),
      ),
    ]
  }

  private static async enforceConnectionCap() {
    const libp2p = (this.waku as any)?.libp2p
    if (!libp2p) {
      return
    }

    const connections = libp2p.getConnections?.() ?? []
    if (connections.length <= this.maxConnections) {
      return
    }

    const bootstrapPeerIds = this.getConfiguredBootstrapPeerIds()
    const removableConnections = [...connections].sort((a: any, b: any) => {
      const aIsBootstrap = bootstrapPeerIds.has(
        this.formatDiscoveryPeerId(a?.remotePeer),
      )
      const bIsBootstrap = bootstrapPeerIds.has(
        this.formatDiscoveryPeerId(b?.remotePeer),
      )
      return Number(bIsBootstrap) - Number(aIsBootstrap)
    })
    const excessConnections = removableConnections.slice(this.maxConnections)

    for (const connection of excessConnections) {
      await libp2p.hangUp(connection.remotePeer).catch(() => {})
    }
  }

  protected static getDialableMultiaddrs(peerInfo: any): string[] {
    return this.getPeerInfoWssMultiaddrs(peerInfo)
  }

  protected static mapNewPeerInfo(peerInfo: any): any | undefined {
    const dialableMultiaddrs = this.getDialableMultiaddrs(peerInfo)
    if (!dialableMultiaddrs.length) {
      return undefined
    }

    return {
      ...peerInfo,
      multiaddrs: dialableMultiaddrs,
    }
  }

  protected static onBeforeSelectPeerInfos() {
    this.pruneAdmittedPeerExchangePeerIds()
  }

  protected static async onPeerInfosSelected(peerInfos: any[]) {
    await this.dialDiscoveredPeers(peerInfos)
  }

  protected static getPeerExchangeAttemptBuffer(): number {
    return 2
  }

  protected static applyConnectionLimitGuard() {
    const connectionManager = (this.waku as any)?.connectionManager
    const dialer = connectionManager?.dialer
    const libp2p = (this.waku as any)?.libp2p
    if (!dialer || !libp2p || dialer.__wakuConnectionLimitGuardApplied) {
      return
    }

    const originalShouldSkipPeer = dialer.shouldSkipPeer?.bind(dialer)
    if (typeof originalShouldSkipPeer !== "function") {
      return
    }

    dialer.shouldSkipPeer = async (peerId: any) => {
      const shouldSkip = await originalShouldSkipPeer(peerId)
      if (shouldSkip) {
        return true
      }

      const connectionCount = libp2p.getConnections().length
      if (connectionCount >= this.maxConnections) {
        return true
      }

      return false
    }

    dialer.__wakuConnectionLimitGuardApplied = true

    if (!libp2p.__wakuConnectionCapListenerApplied) {
      libp2p.addEventListener?.("peer:connect", (_event: any) => {
        void this.enforceConnectionCap()
      })
      libp2p.__wakuConnectionCapListenerApplied = true
    }
  }

  protected static buildDnsPeerDiscovery(enrTreePeers: string[]) {
    return this.createDialingDnsPeerDiscovery(enrTreePeers)
  }

  protected static async afterNodeCreated() {
    await this.flushPendingDiscoveredPeers()
  }

  protected static async beforeNodeStart() {
    BroadcasterDebug.log("Start Waku.")
  }

  protected static async afterNodeStart() {
    await this.flushPendingDiscoveredPeers()
  }

  protected static getConnectedLogMessage(): string {
    return "Connected to Waku"
  }

  protected static handleConnectError(err: unknown): void {
    if (!(err instanceof Error)) {
      throw err
    }
    this.hasError = true
    throw err
  }
}
