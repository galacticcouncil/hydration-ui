// Vendored from upstream
// `packages/common/src/waku/waku-broadcaster-waku-core-base.ts`. shared-models
// import routes through the local shim.
import { Chain, delay } from "../shared-models-shim.js"
import { WakuObservers } from "./waku-observers.js"
import { BroadcasterDebug } from "../utils/broadcaster-debug.js"
import { utf8ToBytes } from "../utils/conversion.js"
import { isDefined } from "../utils/is-defined.js"
import {
  createEncoder,
  createDecoder,
  type LightNode,
  type QueryRequestParams,
} from "@waku/sdk"
import { BroadcasterOptions } from "../models/index.js"
import { WAKU_RAILGUN_PUB_SUB_TOPIC } from "../models/constants.js"
import { BroadcasterFeeCache } from "../fees/broadcaster-fee-cache.js"
import { BroadcasterConfig } from "../models/broadcaster-config.js"
import { getWakuHealthSnapshot } from "./waku-healthcheck.js"

export abstract class WakuBroadcasterWakuCoreBase {
  static hasError = false
  static restartCallback: () => void

  static waku: Optional<LightNode>

  protected static pubSubTopic = WAKU_RAILGUN_PUB_SUB_TOPIC
  protected static additionalDirectPeers: string[] = []
  protected static peerDiscoveryTimeout = 60000
  public static restartCount = 0

  static async initWaku(chain: Chain): Promise<void> {
    try {
      await this.connect()
      if (!this.waku) {
        BroadcasterDebug.log("No waku instance found")
        return
      }
      WakuObservers.resetCurrentChain()
      await WakuObservers.setObserversForChain(this.waku, chain)

      this.pollHistoricalTopics()
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err
      }
      BroadcasterDebug.error(err)
      throw err
    }
  }

  static async pollHistoricalTopics() {
    BroadcasterDebug.log("Polling historical messages")
    const topics = WakuObservers.getCurrentContentTopics()
    for (const topic of topics) {
      await this.retrieveHistoricalForTopic(topic)
    }
    await delay(10_000)
  }

  static setWakuRestartCallback(callback: () => void) {
    this.restartCallback = callback
  }

  static async reinitWaku(chain: Chain) {
    if (isDefined(this.waku) && this.waku.isStarted()) {
      await this.disconnect()
    }
    BroadcasterFeeCache.resetCache(chain)
    BroadcasterDebug.log(`Reinit Waku, ${++this.restartCount}`)
    await this.initWaku(chain)
    if (this.restartCallback) {
      this.restartCallback()
    }
  }

  static setBroadcasterOptions(broadcasterOptions: BroadcasterOptions) {
    BroadcasterConfig.trustedFeeSigner = broadcasterOptions.trustedFeeSigner

    BroadcasterConfig.configureWakuNetwork({
      clusterId: broadcasterOptions.clusterId,
      shardId: broadcasterOptions.shardId,
      pubSubTopic: broadcasterOptions.pubSubTopic,
    })

    this.pubSubTopic = BroadcasterConfig.pubSubTopic
    if (broadcasterOptions.additionalDirectPeers) {
      this.additionalDirectPeers = broadcasterOptions.additionalDirectPeers
    }
    if (isDefined(broadcasterOptions.peerDiscoveryTimeout)) {
      this.peerDiscoveryTimeout = broadcasterOptions.peerDiscoveryTimeout
    }
    if (isDefined(broadcasterOptions.feeExpirationTimeout)) {
      BroadcasterConfig.feeExpirationTimeout =
        broadcasterOptions.feeExpirationTimeout
    }
    if (isDefined(broadcasterOptions.historicalLookBackTime)) {
      BroadcasterConfig.historicalLookBackTime =
        broadcasterOptions.historicalLookBackTime
    }
  }

  static async disconnect() {
    await WakuObservers.unsubscribe(this.waku)
    await this.waku?.stop()
    this.waku = undefined
  }

  protected static connect(): Promise<void> {
    throw new Error("Method 'connect' must be implemented.")
  }

  static getMeshPeerCount(): number {
    return 0
  }

  static getPubSubPeerCount(): number {
    return 0
  }

  static async getLightPushPeerCount(): Promise<number> {
    if (!this.waku) return 0
    return this.waku.libp2p.getConnections().length
  }

  static async getFilterPeerCount(): Promise<number> {
    if (!this.waku) return 0
    return this.waku.libp2p.getConnections().length
  }

  static async getHealthSnapshot() {
    return getWakuHealthSnapshot({
      hasError: this.hasError,
      peerDiscoveryTimeout: this.peerDiscoveryTimeout,
      restartCount: this.restartCount,
      waku: this.waku,
    })
  }

  private static getLightPushAcceptedCount(result: {
    successes?: unknown[]
    recipients?: unknown[]
    failures?: unknown[]
  }): number {
    if (Array.isArray(result.successes)) {
      return result.successes.length
    }
    if (Array.isArray(result.recipients)) {
      return result.recipients.length
    }
    return 0
  }

  static async broadcastMessage(data: object, topic: string): Promise<void> {
    if (!this.waku) {
      throw new Error("Waku not initialized")
    }
    const encoder = createEncoder({
      contentTopic: topic,
      routingInfo: BroadcasterConfig.getWakuRoutingInfo(),
    })

    const payload = utf8ToBytes(JSON.stringify(data))

    const result = await this.waku.lightPush.send(encoder, {
      payload,
    })

    const acceptedCount = this.getLightPushAcceptedCount(result)
    const failures = result.failures ?? []

    if (failures.length > 0) {
      if (acceptedCount > 0) {
        return
      }

      throw new Error("Failed to send message")
    }
  }

  static async retrieveHistoricalForTopic(topic: string): Promise<void> {
    if (!this.waku) {
      return
    }

    const callback = WakuObservers.getCallbackForTopic(topic)
    if (!callback) {
      BroadcasterDebug.log(`No callback found for topic: ${topic}`)
      return
    }

    const decoder = createDecoder(topic, BroadcasterConfig.getWakuRoutingInfo())

    try {
      const startTime = new Date()
      startTime.setTime(Date.now() - BroadcasterConfig.historicalLookBackTime)
      const endTime = new Date(Date.now())
      const options: QueryRequestParams = {
        includeData: true,
        pubsubTopic: BroadcasterConfig.pubSubTopic,
        contentTopics: [topic],
        paginationForward: true,
      }
      const lastMessage = WakuObservers.getLastMessage(topic)
      if (lastMessage) {
        const cursor = this.waku.store.createCursor(lastMessage)
        options.paginationCursor = cursor
      } else {
        options.timeStart = startTime
        options.timeEnd = endTime
      }
      const generator = this.waku.store.queryGenerator([decoder], options)
      for await (const messagesPromises of generator) {
        messagesPromises.reverse()
        for (const messagePromise of messagesPromises) {
          if (isDefined(messagePromise)) {
            const message = await messagePromise
            if (isDefined(message)) {
              callback(message)
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        BroadcasterDebug.log(
          `Error retrieving historical messages: ${err.message}`,
        )
      }
    }
  }
}
