// Vendored verbatim from upstream
// `packages/common/src/status/broadcaster-connection-status.ts`.
import {
  CachedTokenFee,
  Chain,
  BroadcasterConnectionStatus,
} from "../shared-models-shim.js"
import { BroadcasterFeeCache } from "../fees/broadcaster-fee-cache.js"
import { AddressFilter } from "../filters/address-filter.js"
import { cachedFeeExpired } from "../utils/broadcaster-util.js"
import { WakuBroadcasterWakuCore } from "../waku/waku-broadcaster-waku-core.js"
import { BroadcasterConfig } from "../models/broadcaster-config.js"
import { isDefined } from "../utils/is-defined.js"

export class BroadcasterStatus {
  static getBroadcasterConnectionStatus(
    chain: Chain,
  ): BroadcasterConnectionStatus {
    if (WakuBroadcasterWakuCore.hasError) {
      return BroadcasterConnectionStatus.Error
    }
    if (!WakuBroadcasterWakuCore.waku) {
      return BroadcasterConnectionStatus.Disconnected
    }

    if (this.hasSubscriptionsStalled()) {
      BroadcasterFeeCache.lastSubscribedFeeMessageReceivedAt =
        Date.now() + 5000
      return BroadcasterConnectionStatus.Disconnected
    }

    if (!this.hasBroadcasterFeesForNetwork(chain)) {
      return BroadcasterConnectionStatus.Searching
    }

    const { allBroadcasterFeesExpired, anyBroadcastersAvailable } =
      this.getAggregatedInfoForBroadcasters(chain)
    if (allBroadcasterFeesExpired) {
      return BroadcasterConnectionStatus.Disconnected
    }
    if (!anyBroadcastersAvailable) {
      return BroadcasterConnectionStatus.AllUnavailable
    }

    return BroadcasterConnectionStatus.Connected
  }

  static hasSubscriptionsStalled() {
    const now = Date.now()
    const limit = BroadcasterConfig.feeExpirationTimeout
    const lastSubscribed =
      BroadcasterFeeCache.lastSubscribedFeeMessageReceivedAt
    if (isDefined(lastSubscribed)) {
      return now - lastSubscribed > limit
    }
    return false
  }

  private static hasBroadcasterFeesForNetwork(chain: Chain) {
    const broadcasterFees = BroadcasterFeeCache.feesForChain(chain)
    if (!isDefined(broadcasterFees) || !isDefined(broadcasterFees.forToken)) {
      return false
    }

    const cachedTokenBroadcasters = Object.values(broadcasterFees.forToken)

    return (
      cachedTokenBroadcasters.find((tokenBroadcasterMap) => {
        const unfilteredBroadcasterAddresses = Object.keys(
          tokenBroadcasterMap.forBroadcaster,
        )
        const filteredBroadcasterAddresses = AddressFilter.filter(
          unfilteredBroadcasterAddresses,
        )
        return filteredBroadcasterAddresses.length > 0
      }) != null
    )
  }

  private static getAggregatedInfoForBroadcasters(chain: Chain) {
    const broadcasterFees = BroadcasterFeeCache.feesForChain(chain)
    if (!isDefined(broadcasterFees) || !isDefined(broadcasterFees.forToken)) {
      return {
        allBroadcasterFeesExpired: false,
        anyBroadcastersAvailable: false,
      }
    }

    const cachedTokenBroadcasters = Object.values(broadcasterFees.forToken)

    let allBroadcasterFeesExpired = true
    let anyBroadcastersAvailable = false

    cachedTokenBroadcasters.forEach((tokenBroadcasterMap) => {
      const unfilteredRailgunAddresses = Object.keys(
        tokenBroadcasterMap.forBroadcaster,
      )
      const filteredRailgunAddresses = AddressFilter.filter(
        unfilteredRailgunAddresses,
      )
      filteredRailgunAddresses.forEach((railgunAddress) => {
        const identifiers: string[] = Object.keys(
          tokenBroadcasterMap.forBroadcaster[railgunAddress].forIdentifier,
        )

        identifiers.every((identifier) => {
          const tokenFee: CachedTokenFee =
            tokenBroadcasterMap.forBroadcaster[railgunAddress].forIdentifier[
              identifier
            ]
          if (cachedFeeExpired(tokenFee.expiration)) {
            return true
          }

          allBroadcasterFeesExpired = false

          if (tokenFee.availableWallets > 0) {
            anyBroadcastersAvailable = true
            return false
          }
          return true
        })
      })
    })

    return { allBroadcasterFeesExpired, anyBroadcastersAvailable }
  }
}
