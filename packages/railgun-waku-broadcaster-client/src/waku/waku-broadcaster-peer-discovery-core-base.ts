// Vendored verbatim from upstream
// `packages/common/src/waku/waku-broadcaster-peer-discovery-core-base.ts`.
import { Protocols, type CreateLibp2pOptions } from "@waku/sdk"
import { BroadcasterDebug } from "../utils/broadcaster-debug.js"
import { isDefined } from "../utils/is-defined.js"
import { BroadcasterConfig } from "../models/broadcaster-config.js"
import { WakuBroadcasterWakuCoreBase } from "./waku-broadcaster-waku-core-base.js"
import {
  createLoggedPeerExchangeDiscovery,
  formatDiscoveryPeerId,
  getConnectionManagerOptions,
  getDnsDiscoveryUrls,
  getKnownPeerIds,
} from "./waku-peer-discovery.js"

export abstract class WakuBroadcasterPeerDiscoveryCoreBase extends WakuBroadcasterWakuCoreBase {
  protected static readonly maxBootstrapPeers = 2
  protected static readonly maxConnections = 5
  protected static admittedPeerExchangePeerIds = new Set<string>()
  protected static dialingPeerExchangePeerIds = new Set<string>()
  protected static pendingDiscoveredPeerInfos = new Map<string, any>()

  protected static createWakuNode: (options: any) => Promise<any>
  protected static createDnsPeerDiscovery: (enrTreePeers: string[]) => any
  protected static createPeerExchangeDiscovery: () => (components: any) => any

  protected static getEnrTrees(): {
    SANDBOX: string
    TEST: string
  } {
    throw new Error("Method 'getEnrTrees' must be implemented.")
  }

  protected static getDefaultPeers(): string[] {
    throw new Error("Method 'getDefaultPeers' must be implemented.")
  }

  protected static getBaseLibp2pOptions(): CreateLibp2pOptions {
    return {
      hideWebSocketInfo: true,
    }
  }

  protected static buildDnsPeerDiscovery(enrTreePeers: string[]) {
    return this.createDnsPeerDiscovery(enrTreePeers)
  }

  protected static getDnsDiscoveryUrls(): string[] {
    return getDnsDiscoveryUrls(this.getEnrTrees(), BroadcasterConfig.customDNS)
  }

  protected static getConnectionManagerOptions() {
    return getConnectionManagerOptions(
      this.maxBootstrapPeers,
      this.maxConnections,
    )
  }

  protected static formatDiscoveryPeerId(peerId: any): string {
    return formatDiscoveryPeerId(peerId)
  }

  protected static async getKnownPeerIds(peerStore?: {
    all?: () => Promise<any[]>
  }): Promise<Set<string>> {
    return getKnownPeerIds(peerStore)
  }

  protected static getPeerInfoId(peerInfo: any): string {
    return this.formatDiscoveryPeerId(
      peerInfo?.id ?? peerInfo?.ENR?.peerInfo?.id,
    )
  }

  protected static getPeerInfoMultiaddrStrings(peerInfo: any): string[] {
    const rawMultiaddrs =
      peerInfo?.multiaddrs ??
      peerInfo?.ENR?.peerInfo?.multiaddrs ??
      peerInfo?.ENR?.multiaddrs ??
      []
    if (!Array.isArray(rawMultiaddrs)) {
      return []
    }

    return rawMultiaddrs
      .map((multiaddr) => multiaddr?.toString?.() ?? String(multiaddr ?? ""))
      .map((multiaddr) => multiaddr.trim())
      .filter(Boolean)
  }

  protected static getConnectedPeerIds(): Set<string> {
    const connections = (this.waku as any)?.libp2p?.getConnections?.() ?? []
    return new Set(
      connections.map((connection: any) =>
        this.formatDiscoveryPeerId(connection?.remotePeer),
      ),
    )
  }

  protected static getConfiguredBootstrapPeerIds(): Set<string> {
    const directPeers = BroadcasterConfig.additionalDirectPeers.length
      ? BroadcasterConfig.additionalDirectPeers
      : this.getDefaultPeers()

    return new Set(
      directPeers
        .map((peer) => peer.match(/\/p2p\/([^/]+)$/)?.[1])
        .filter(isDefined),
    )
  }

  protected static pruneAdmittedPeerExchangePeerIds() {
    const connectedPeerIds = this.getConnectedPeerIds()
    this.admittedPeerExchangePeerIds = new Set(
      [...this.admittedPeerExchangePeerIds].filter((peerId) =>
        connectedPeerIds.has(peerId),
      ),
    )
  }

  protected static queueDiscoveredPeer(peerInfo: any) {
    const peerId = this.getPeerInfoId(peerInfo)
    this.pendingDiscoveredPeerInfos.set(peerId, peerInfo)
  }

  protected static async flushPendingDiscoveredPeers() {
    if (!this.waku || this.pendingDiscoveredPeerInfos.size === 0) {
      return
    }

    const peerInfos = [...this.pendingDiscoveredPeerInfos.values()]
    this.pendingDiscoveredPeerInfos.clear()
    await this.dialDiscoveredPeers(peerInfos)
  }

  protected static getDialableMultiaddrs(_peerInfo: any): string[] {
    return []
  }

  protected static handleDialDiscoveredPeerFailure(peerId: string) {
    this.admittedPeerExchangePeerIds.delete(peerId)
  }

  protected static createDialingDnsPeerDiscovery(enrTreePeers: string[]) {
    return (components: any) => {
      const discovery = this.createDnsPeerDiscovery(enrTreePeers)(
        components,
      ) as any
      const onPeer = ((event: CustomEvent<any>) => {
        this.queueDiscoveredPeer(event.detail)
        void this.dialDiscoveredPeers([event.detail])
      }) as EventListener

      discovery.addEventListener?.("peer", onPeer)
      return discovery
    }
  }

  protected static async dialDiscoveredPeers(peerInfos: any[]) {
    const waku = this.waku
    if (!waku) {
      for (const peerInfo of peerInfos) {
        this.queueDiscoveredPeer(peerInfo)
      }
      return
    }

    const connectedPeerIds = this.getConnectedPeerIds()

    await Promise.all(
      peerInfos.map(async (peerInfo) => {
        const peerId = this.getPeerInfoId(peerInfo)
        if (
          connectedPeerIds.has(peerId) ||
          this.dialingPeerExchangePeerIds.has(peerId)
        ) {
          return
        }

        const [multiaddr] = this.getDialableMultiaddrs(peerInfo)
        if (!multiaddr) {
          return
        }

        this.dialingPeerExchangePeerIds.add(peerId)
        try {
          await waku.dial(multiaddr)
        } catch {
          this.handleDialDiscoveredPeerFailure(peerId)
        } finally {
          this.dialingPeerExchangePeerIds.delete(peerId)
        }
      }),
    )
  }

  protected static mapNewPeerInfo(peerInfo: any): any | undefined {
    return peerInfo
  }

  protected static onBeforeSelectPeerInfos() {}

  protected static async onPeerInfosSelected(_peerInfos: any[]) {}

  protected static getPeerExchangeAttemptBuffer(): number {
    return 0
  }

  protected static resetPlatformDiscoveryState() {
    this.admittedPeerExchangePeerIds.clear()
    this.dialingPeerExchangePeerIds.clear()
    this.pendingDiscoveredPeerInfos.clear()
  }

  protected static async afterNodeCreated() {}

  protected static async beforeNodeStart() {}

  protected static async afterNodeStart() {}

  protected static applyConnectionLimitGuard() {}

  protected static getConnectedLogMessage(): string {
    return "Waku initialized and connected to peers"
  }

  protected static handleConnectError(err: unknown): void {
    const message = err instanceof Error ? err.message : String(err)
    BroadcasterDebug.log(`Error initializing Waku: ${message}`)
    this.hasError = true
  }

  protected static createLoggedPeerExchangeDiscovery() {
    return createLoggedPeerExchangeDiscovery({
      createPeerExchangeDiscovery: () => this.createPeerExchangeDiscovery(),
      getAdmittedPeerExchangePeerIds: () => this.admittedPeerExchangePeerIds,
      getKnownPeerIds: (peerStore) => this.getKnownPeerIds(peerStore),
      getPeerInfoId: (peerInfo) => this.getPeerInfoId(peerInfo),
      mapNewPeerInfo: (peerInfo) => this.mapNewPeerInfo(peerInfo),
      maxBootstrapPeers: this.maxBootstrapPeers,
      maxConnections: this.maxConnections,
      onBeforeSelectPeerInfos: () => this.onBeforeSelectPeerInfos(),
      onPeerInfosSelected: (peerInfos) => this.onPeerInfosSelected(peerInfos),
      peerExchangeAttemptBuffer: this.getPeerExchangeAttemptBuffer(),
    })
  }

  protected static async connect(): Promise<void> {
    try {
      this.hasError = false
      this.resetPlatformDiscoveryState()

      BroadcasterDebug.log("Creating waku broadcast client")

      const libp2pOptions = this.getBaseLibp2pOptions()
      if (BroadcasterConfig.useDNSDiscovery) {
        const enrTreePeers = this.getDnsDiscoveryUrls()
        libp2pOptions.peerDiscovery = [
          this.buildDnsPeerDiscovery(enrTreePeers),
          this.createLoggedPeerExchangeDiscovery(),
        ]
      }

      const defaultPeers = this.getDefaultPeers()
      const directPeers = BroadcasterConfig.additionalDirectPeers.length
        ? BroadcasterConfig.additionalDirectPeers
        : defaultPeers
      const storePeers = BroadcasterConfig.storePeers.length
        ? BroadcasterConfig.storePeers
        : defaultPeers

      this.waku = await this.createWakuNode({
        autoStart: false,
        defaultBootstrap: BroadcasterConfig.shouldUseDefaultBootstrap(),
        bootstrapPeers: directPeers,
        libp2p: libp2pOptions,
        networkConfig: BroadcasterConfig.getWakuNetworkConfig(),
        store: {
          peers: storePeers,
        },
        ...this.getConnectionManagerOptions(),
      })
      const waku = this.waku
      if (!waku) {
        throw new Error("Waku node was not created")
      }

      await this.afterNodeCreated()
      this.applyConnectionLimitGuard()
      await this.beforeNodeStart()
      await waku.start()
      await this.afterNodeStart()

      BroadcasterDebug.log("Waiting for remote peer.")
      await waku.waitForPeers(
        [Protocols.Filter, Protocols.LightPush, Protocols.Store],
        this.peerDiscoveryTimeout,
      )
      BroadcasterDebug.log(this.getConnectedLogMessage())
      this.hasError = false
    } catch (err) {
      this.handleConnectError(err)
    }
  }
}
