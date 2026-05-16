// Vendored from upstream `packages/common/src/fees/broadcaster-fee-cache.ts`.
// Only change: networkForChain comes from the local shim so Hydration
// (chain id 222222) gets a real Network record.
import { CachedTokenFee, Chain } from "../shared-models-shim.js"
import { networkForChain } from "../shared-models-shim.js"
import { AddressFilter } from "../filters/address-filter.js"
import { BroadcasterConfig } from "../models/broadcaster-config.js"
import { BroadcasterDebug } from "../utils/broadcaster-debug.js"
import {
  nameForBroadcaster,
  cachedFeeExpired,
  DEFAULT_BROADCASTER_IDENTIFIER,
  invalidBroadcasterVersion,
  cachedFeeUnavailableOrExpired,
} from "../utils/broadcaster-util.js"

type BroadcasterFeeNetworkTokenBroadcasterCacheMap = {
  forIdentifier: MapType<CachedTokenFee>
}
type BroadcasterFeeNetworkTokenCacheMap = {
  forBroadcaster: MapType<BroadcasterFeeNetworkTokenBroadcasterCacheMap>
}
type BroadcasterFeeNetworkCacheMap = {
  forToken: MapType<BroadcasterFeeNetworkTokenCacheMap>
}
export type BroadcasterFeeCacheState = {
  forNetwork: MapType<BroadcasterFeeNetworkCacheMap>
}

export class BroadcasterFeeCache {
  private static cache: BroadcasterFeeCacheState = { forNetwork: {} }
  private static authorizedFees: MapType<MapType<CachedTokenFee>> = {}
  private static averageAuthorizedFees: MapType<CachedTokenFee> = {}
  static lastSubscribedFeeMessageReceivedAt: Optional<number>
  private static poiActiveListKeys: Optional<string[]>

  static init(poiActiveListKeys: string[]) {
    this.poiActiveListKeys = poiActiveListKeys
    this.lastSubscribedFeeMessageReceivedAt = Date.now()
  }

  static addTokenFees(
    chain: Chain,
    railgunAddress: string,
    feeExpiration: number,
    tokenFeeMap: MapType<CachedTokenFee>,
    identifier: Optional<string>,
    version: string,
    requiredPOIListKeys: string[],
  ) {
    const network = networkForChain(chain)
    if (!network) {
      return
    }

    if (!this.poiActiveListKeys) {
      throw new Error(
        "Must define active POI list keys before adding any fees.",
      )
    }
    for (const listKey of requiredPOIListKeys) {
      if (!this.poiActiveListKeys.includes(listKey)) {
        BroadcasterDebug.log(
          `[Fees] Broadcaster ${railgunAddress} requires POI list key ${listKey}, which is not active.`,
        )
        return
      }
    }

    const broadcasterName = nameForBroadcaster(railgunAddress, identifier)
    const networkName = network.name

    if (invalidBroadcasterVersion(version)) {
      BroadcasterDebug.log(
        `[Fees] Broadcaster version ${version} invalid (req ${BroadcasterConfig.MINIMUM_BROADCASTER_VERSION}-${BroadcasterConfig.MAXIMUM_BROADCASTER_VERSION}): ${broadcasterName}`,
      )
      return
    }

    if (cachedFeeExpired(feeExpiration)) {
      BroadcasterDebug.log(
        `[Fees] Fees expired for ${networkName} (${broadcasterName})`,
      )
      return
    }

    const tokenAddresses = Object.keys(tokenFeeMap)
    BroadcasterDebug.log(
      `[Fees] Updating fees for ${networkName} (${broadcasterName}): ${tokenAddresses.length} tokens`,
    )

    this.cache.forNetwork[networkName] ??= { forToken: {} }

    const tokenAddressesLowercase = tokenAddresses.map((address) =>
      address.toLowerCase(),
    )
    tokenAddressesLowercase.forEach((tokenAddress) => {
      this.cache.forNetwork[networkName].forToken[tokenAddress] ??= {
        forBroadcaster: {},
      }
      this.cache.forNetwork[networkName].forToken[tokenAddress].forBroadcaster[
        railgunAddress
      ] ??= { forIdentifier: {} }

      this.cache.forNetwork[networkName].forToken[tokenAddress].forBroadcaster[
        railgunAddress
      ].forIdentifier[identifier ?? DEFAULT_BROADCASTER_IDENTIFIER] =
        tokenFeeMap[tokenAddress]
    })
    BroadcasterFeeCache.lastSubscribedFeeMessageReceivedAt = Date.now()
  }

  static resetCache(chain: Chain) {
    const network = networkForChain(chain)
    if (!network) {
      return
    }
    this.cache.forNetwork ??= {}
    delete this.cache.forNetwork[network.name]
  }

  static feesForChain(chain: Chain): Optional<BroadcasterFeeNetworkCacheMap> {
    const network = networkForChain(chain)
    if (!network) {
      throw new Error("Chain not found.")
    }
    return this.cache.forNetwork[network.name]
  }

  static feesForToken(
    chain: Chain,
    tokenAddress: string,
  ): Optional<BroadcasterFeeNetworkTokenCacheMap> {
    return this.feesForChain(chain)?.forToken[tokenAddress.toLowerCase()]
  }

  static supportsToken(
    chain: Chain,
    tokenAddress: string,
    useRelayAdapt: boolean,
  ): boolean {
    const feesForToken = this.feesForToken(chain, tokenAddress)
    if (!feesForToken) {
      return false
    }

    const railgunAddresses = Object.keys(feesForToken.forBroadcaster)
    const filteredRailgunAddresses = AddressFilter.filter(railgunAddresses)

    const cachedFees: CachedTokenFee[] = filteredRailgunAddresses
      .map((railgunAddress) =>
        Object.values(
          feesForToken.forBroadcaster[railgunAddress].forIdentifier,
        ),
      )
      .flat()

    const availableUnexpiredFee = cachedFees.find(
      (cachedFee) =>
        !cachedFeeUnavailableOrExpired(cachedFee, chain, useRelayAdapt),
    )
    return availableUnexpiredFee != null
  }

  static addAuthorizedFees(
    signerAddress: string,
    tokenFeeMap: MapType<CachedTokenFee>,
  ) {
    const newFees = Object.entries(tokenFeeMap)
    const signerAddressLC = signerAddress.toLowerCase()
    this.authorizedFees[signerAddressLC] ??= {}

    const updatedTokens: string[] = []

    for (const [tokenAddress, feeMap] of newFees) {
      const tokenAddressLC = tokenAddress.toLowerCase()
      const existing = this.authorizedFees[signerAddressLC][tokenAddressLC]
      if (existing && existing.expiration >= feeMap.expiration) {
        continue
      }
      this.authorizedFees[signerAddressLC][tokenAddressLC] = feeMap
      updatedTokens.push(tokenAddressLC)
    }
    this.updateAverageAuthorizedFees(updatedTokens)
  }

  private static updateAverageAuthorizedFees(tokenAddresses: string[]) {
    const trustedSigners = BroadcasterConfig.trustedFeeSigner
    const isTrustedSignerConfigured =
      trustedSigners != null &&
      (typeof trustedSigners === "string" || trustedSigners.length > 0)

    tokenAddresses.forEach((tokenAddressLC) => {
      const authorizedFeesForToken: CachedTokenFee[] = []

      Object.keys(this.authorizedFees).forEach((signerAddress) => {
        if (isTrustedSignerConfigured) {
          if (typeof trustedSigners === "string") {
            if (signerAddress !== trustedSigners.toLowerCase()) {
              return
            }
          } else if (Array.isArray(trustedSigners)) {
            if (
              !trustedSigners
                .map((s) => s.toLowerCase())
                .includes(signerAddress.toLowerCase())
            ) {
              return
            }
          }
        }

        const fee = this.authorizedFees[signerAddress][tokenAddressLC]
        if (fee) {
          if (cachedFeeExpired(fee.expiration)) {
            delete this.authorizedFees[signerAddress][tokenAddressLC]
            return
          }
          authorizedFeesForToken.push(fee)
        }
      })

      if (authorizedFeesForToken.length === 0) {
        delete this.averageAuthorizedFees[tokenAddressLC]
        return
      }

      if (authorizedFeesForToken.length === 1) {
        this.averageAuthorizedFees[tokenAddressLC] = authorizedFeesForToken[0]
        return
      }

      let totalFee = 0n
      authorizedFeesForToken.forEach((fee) => {
        totalFee += BigInt(fee.feePerUnitGas)
      })
      const averageFee = totalFee / BigInt(authorizedFeesForToken.length)

      const baseFee = authorizedFeesForToken[0]
      this.averageAuthorizedFees[tokenAddressLC] = {
        ...baseFee,
        feePerUnitGas: "0x" + averageFee.toString(16),
      }
    })
  }

  static getAuthorizedFee(tokenAddress: string): Optional<CachedTokenFee> {
    return this.averageAuthorizedFees[tokenAddress.toLowerCase()]
  }
}
