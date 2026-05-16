// Vendored from upstream
// `packages/common/src/waku-broadcaster-client.ts`.
//
// Changes vs. upstream:
// - shared-models imports route through the local shim.
// - `POI_REQUIRED_LISTS` import retained; we just pass `[]` from
//   `BroadcasterProvider` so POI gating is off on Hydration.
import {
  Chain,
  delay,
  POI_REQUIRED_LISTS,
  BroadcasterConnectionStatus,
  SelectedBroadcaster,
  isDefined,
} from "./shared-models-shim.js"
import { BroadcasterFeeCache } from "./fees/broadcaster-fee-cache.js"
import { AddressFilter } from "./filters/address-filter.js"
import {
  BroadcasterConnectionStatusCallback,
  BroadcasterDebugger,
  BroadcasterOptions,
} from "./models/export-models.js"
import { BroadcasterConfig } from "./models/broadcaster-config.js"
import { BroadcasterSearch } from "./search/best-broadcaster.js"
import { BroadcasterStatus } from "./status/broadcaster-connection-status.js"
import { BroadcasterDebug } from "./utils/broadcaster-debug.js"
import { WakuObservers } from "./waku/waku-observers.js"
import { WakuBroadcasterWakuCore } from "./waku/waku-broadcaster-waku-core.js"
import type { LightNode } from "@waku/sdk"
import { contentTopics } from "./waku/waku-topics.js"

export class WakuBroadcasterClient {
  private static chain: Chain
  private static statusCallback: BroadcasterConnectionStatusCallback
  private static started = false
  private static isRestarting = false

  static pollDelay = 3_000

  static async start(
    chain: Chain,
    broadcasterOptions: BroadcasterOptions,
    statusCallback: BroadcasterConnectionStatusCallback,
    broadcasterDebugger?: BroadcasterDebugger,
  ) {
    this.chain = chain
    this.statusCallback = statusCallback

    WakuBroadcasterWakuCore.setBroadcasterOptions(broadcasterOptions)

    if (isDefined(broadcasterOptions.broadcasterVersionRange)) {
      BroadcasterConfig.MINIMUM_BROADCASTER_VERSION =
        broadcasterOptions.broadcasterVersionRange.minVersion
      BroadcasterConfig.MAXIMUM_BROADCASTER_VERSION =
        broadcasterOptions.broadcasterVersionRange.maxVersion
    }

    BroadcasterConfig.configurePeerConnections({
      useDNSDiscovery: broadcasterOptions.useDNSDiscovery,
      useCustomDNS: broadcasterOptions.useCustomDNS,
      dnsDiscoveryUrls: broadcasterOptions.dnsDiscoveryUrls,
      additionalDirectPeers: broadcasterOptions.additionalDirectPeers,
      additionalPeers: broadcasterOptions.additionalPeers,
      storePeers: broadcasterOptions.storePeers,
    })
    BroadcasterConfig.setHealthcheckLoggingEnabled(
      broadcasterOptions.enableHealthcheckLogs ?? false,
    )

    if (isDefined(broadcasterDebugger)) {
      BroadcasterDebug.setDebugger(broadcasterDebugger)
    }

    BroadcasterFeeCache.init(
      broadcasterOptions.poiActiveListKeys ??
        POI_REQUIRED_LISTS.map((list) => list.key),
    )

    try {
      this.started = false
      await WakuBroadcasterWakuCore.initWaku(chain)
      this.started = true

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.pollStatus()
    } catch (cause) {
      if (!(cause instanceof Error)) {
        throw new Error("Unexpected non-error thrown", { cause })
      }
      throw new Error("Cannot connect to Broadcaster network.", { cause })
    }
  }

  static async stop() {
    await WakuBroadcasterWakuCore.disconnect()
    this.started = false
    this.updateStatus()
  }

  static isStarted() {
    return this.started
  }

  static setHealthcheckLoggingEnabled(enabled: boolean) {
    BroadcasterConfig.setHealthcheckLoggingEnabled(enabled)
  }

  static async setChain(chain: Chain): Promise<void> {
    if (!WakuBroadcasterClient.started) {
      return
    }

    WakuBroadcasterClient.chain = chain
    await WakuObservers.setObserversForChain(
      WakuBroadcasterWakuCore.waku,
      chain,
    )
    WakuBroadcasterClient.updateStatus()
  }

  static getContentTopics(): string[] {
    return WakuObservers.getCurrentContentTopics()
  }

  static getMeshPeerCount(): number {
    return WakuBroadcasterWakuCore.getMeshPeerCount()
  }

  static getPubSubPeerCount(): number {
    return WakuBroadcasterWakuCore.getPubSubPeerCount()
  }

  static async getLightPushPeerCount(): Promise<number> {
    return await WakuBroadcasterWakuCore.getLightPushPeerCount()
  }

  static async getFilterPeerCount(): Promise<number> {
    return await WakuBroadcasterWakuCore.getFilterPeerCount()
  }

  static findBestBroadcaster(
    chain: Chain,
    tokenAddress: string,
    useRelayAdapt: boolean,
  ): Optional<SelectedBroadcaster> {
    if (!WakuBroadcasterClient.started) {
      return
    }
    return BroadcasterSearch.findBestBroadcaster(
      chain,
      tokenAddress,
      useRelayAdapt,
    )
  }

  static findAllBroadcastersForChain(
    chain: Chain,
    useRelayAdapt: boolean,
  ): Optional<SelectedBroadcaster[]> {
    if (!WakuBroadcasterClient.started) {
      return []
    }
    return BroadcasterSearch.findAllBroadcastersForChain(chain, useRelayAdapt)
  }

  static findRandomBroadcasterForToken(
    chain: Chain,
    tokenAddress: string,
    useRelayAdapt: boolean,
    percentageThreshold: number = 5,
  ): Optional<SelectedBroadcaster> {
    if (!WakuBroadcasterClient.started) {
      return
    }
    return BroadcasterSearch.findRandomBroadcasterForToken(
      chain,
      tokenAddress,
      useRelayAdapt,
      percentageThreshold,
    )
  }

  static findBroadcastersForToken(
    chain: Chain,
    tokenAddress: string,
    useRelayAdapt: boolean,
  ): Optional<SelectedBroadcaster[]> {
    if (!WakuBroadcasterClient.started) {
      return
    }
    return BroadcasterSearch.findBroadcastersForToken(
      chain,
      tokenAddress,
      useRelayAdapt,
    )
  }

  static setAddressFilters(
    allowlist: Optional<string[]>,
    blocklist: Optional<string[]>,
  ): void {
    AddressFilter.setAllowlist(allowlist)
    AddressFilter.setBlocklist(blocklist)
  }

  static async tryReconnect(): Promise<void> {
    BroadcasterFeeCache.resetCache(WakuBroadcasterClient.chain)
    WakuBroadcasterClient.updateStatus()
    await WakuBroadcasterClient.restart()
  }

  static supportsToken(
    chain: Chain,
    tokenAddress: string,
    useRelayAdapt: boolean,
  ) {
    return BroadcasterFeeCache.supportsToken(
      chain,
      tokenAddress,
      useRelayAdapt,
    )
  }

  private static async restart(): Promise<void> {
    if (this.isRestarting || !this.started) {
      return
    }
    this.isRestarting = true
    try {
      BroadcasterDebug.log("Restarting Waku...")
      await WakuBroadcasterWakuCore.reinitWaku(this.chain)
      this.isRestarting = false
    } catch (cause) {
      this.isRestarting = false
      if (!(cause instanceof Error)) {
        return
      }
      BroadcasterDebug.error(
        new Error("Error reinitializing Waku Broadcaster Client", { cause }),
      )
    }
  }

  private static async pollStatus(): Promise<void> {
    this.updateStatus()
    await delay(WakuBroadcasterClient.pollDelay)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.pollStatus()
  }

  private static updateStatus(): BroadcasterConnectionStatus {
    const status = BroadcasterStatus.getBroadcasterConnectionStatus(this.chain)

    this.statusCallback(this.chain, status)
    if (
      status === BroadcasterConnectionStatus.Disconnected ||
      status === BroadcasterConnectionStatus.Error
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.restart()
    }

    return status
  }

  // Waku Transport functions
  static async addTransportSubscription(
    _waku: Optional<LightNode>,
    topic: string,
    callback: (message: any) => void,
  ): Promise<void> {
    await WakuObservers.addTransportSubscription(
      WakuBroadcasterWakuCore.waku,
      topic,
      callback,
    )
  }

  static async sendTransport(data: object, topic: string): Promise<void> {
    const customTopic = contentTopics.encrypted(topic)
    try {
      await WakuBroadcasterWakuCore.broadcastMessage(data, customTopic)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      BroadcasterDebug.log(`SendTransport error: ${message}`)
    }
  }

  static getWakuCore(): Optional<LightNode> {
    return WakuBroadcasterWakuCore.waku
  }

  static setRestartCallback(callback: () => void): void {
    WakuBroadcasterWakuCore.setWakuRestartCallback(callback)
  }
}
