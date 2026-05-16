// Vendored from upstream `packages/common/src/utils/broadcaster-util.ts`.
//
// Only change vs. upstream: imports `networkForChain` from the local shim
// (which knows about Hydration) instead of `@railgun-community/shared-models`
// (which doesn't).
import { CachedTokenFee, Chain, versionCompare } from "../shared-models-shim.js"
import { networkForChain } from "../shared-models-shim.js"
import { BroadcasterConfig } from "../models/broadcaster-config.js"
import { isDefined } from "./is-defined.js"

const FEE_EXPIRATION_MINIMUM_MSEC = 40000

export const DEFAULT_BROADCASTER_IDENTIFIER = "default"

export const shortenAddress = (address: string): string => {
  if (address.length < 13) {
    return address
  }
  // 12 chars separated by '...'
  return `${address.slice(0, 8)}...${address.slice(-4)}`
}

export const nameForBroadcaster = (
  railgunAddress: string,
  identifier: Optional<string>,
) => {
  const shortAddress = shortenAddress(railgunAddress)
  if (isDefined(identifier)) {
    return `${shortAddress}: ${identifier}`
  }
  return shortAddress
}

export const cachedFeeExpired = (feeExpiration: number) => {
  // Minimum of 40sec until expiration, in order to run the proof and submit.
  // If submitted after feeCacheID expires, it risks "Bad token fee" error from Broadcaster.
  return feeExpiration < Date.now() + FEE_EXPIRATION_MINIMUM_MSEC
}

export const invalidBroadcasterVersion = (version: Optional<string>) => {
  return (
    versionCompare(
      version ?? "0.0.0",
      BroadcasterConfig.MINIMUM_BROADCASTER_VERSION,
    ) < 0 ||
    versionCompare(
      version ?? "0.0.0",
      BroadcasterConfig.MAXIMUM_BROADCASTER_VERSION,
    ) > 0
  )
}

export const cachedFeeUnavailableOrExpired = (
  cachedFee: CachedTokenFee,
  chain: Chain,
  useRelayAdapt: boolean,
) => {
  if (useRelayAdapt) {
    const relayAdapt = cachedFee.relayAdapt
    if (!relayAdapt) {
      return true
    }
    const network = networkForChain(chain)
    if (!network) {
      throw new Error(`Unrecognized chain ${chain.type}:${chain.id}`)
    }

    const expectedRelayAdapt = network.relayAdaptHistory
    if (relayAdapt && !expectedRelayAdapt.includes(relayAdapt)) {
      return true
    }
  }

  if (cachedFee.availableWallets === 0) {
    // No available wallets.
    return true
  }

  if (cachedFeeExpired(cachedFee.expiration)) {
    return true
  }

  return false
}
