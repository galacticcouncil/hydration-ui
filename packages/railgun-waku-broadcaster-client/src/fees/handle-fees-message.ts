// Vendored from upstream `packages/common/src/fees/handle-fees-message.ts`.
//
// CHANGE: upstream verifies each fee announcement using
// `verifyBroadcasterSignature` + `getRailgunWalletAddressData` from
// `@railgun-community/wallet`. We don't depend on `@railgun-community/wallet`
// today (we use `@railgun-community/engine` directly), so we **skip the
// signature check** and consume the fee data raw.
//
// Trade-off: a hostile broadcaster could announce arbitrary fees on the
// Hydration content topic. This is only the fee-discovery path — actual
// transact still requires the wallet's encrypted-transact flow, which is
// not wired in Phase 5d. When/if we add `@railgun-community/wallet` to the
// app, restore the signature-verification block here.
import {
  CachedTokenFee,
  Chain,
  BroadcasterFeeMessageData,
} from "../shared-models-shim.js"
import { type IMessage } from "@waku/sdk"
import { contentTopics } from "../waku/waku-topics.js"
import { BroadcasterDebug } from "../utils/broadcaster-debug.js"
import { BroadcasterConfig } from "../models/broadcaster-config.js"
import { BroadcasterFeeCache } from "./broadcaster-fee-cache.js"
import { invalidBroadcasterVersion } from "../utils/broadcaster-util.js"
import { bytesToUtf8, hexToUTF8String } from "../utils/conversion.js"
import { isDefined } from "../utils/is-defined.js"
import { handleAuthorizedFees } from "./handle-authorized-fees-message.js"

const isExpiredTimestamp = (
  timestamp: Optional<Date>,
  expirationFeeTimestamp: Optional<Date>,
) => {
  if (!timestamp || !expirationFeeTimestamp) {
    return false
  }
  let messageTimestamp = timestamp
  if (messageTimestamp.getFullYear() === 1970) {
    messageTimestamp = new Date(messageTimestamp.getTime() * 1000)
  }
  // Expired if message originated > 45 seconds ago.
  // check if fee expires within 45 seconds; if it doesn't ignore it.
  const nowTime = Date.now()
  const expirationMsec = nowTime - 45 * 1000
  const expirationFeeMsec = nowTime + 45 * 1000
  const timestampExpired = messageTimestamp.getTime() < expirationMsec
  if (timestampExpired) {
    BroadcasterDebug.log(
      `Broadcaster Fee STALE: Difference was ${
        (Date.now() - messageTimestamp.getTime()) / 1000
      }s`,
    )
  } else {
    BroadcasterDebug.log(
      `Broadcaster Fee receipt SUCCESS in ${
        (Date.now() - messageTimestamp.getTime()) / 1000
      }s`,
    )
  }
  const feeExpired = expirationFeeTimestamp.getTime() < expirationFeeMsec
  return timestampExpired && feeExpired
}

export const handleBroadcasterFeesMessage = async (
  chain: Chain,
  message: IMessage,
  contentTopic: string,
) => {
  try {
    if (!isDefined(message.payload)) {
      BroadcasterDebug.log("Skipping Broadcaster fees message: NO PAYLOAD")
      return
    }
    if (contentTopic !== contentTopics.fees(chain)) {
      BroadcasterDebug.log("Skipping Broadcaster fees message: WRONG TOPIC")
      return
    }
    const payload = bytesToUtf8(message.payload)
    const { data } = JSON.parse(payload) as {
      data: string
      signature: string
    }
    const utf8String = hexToUTF8String(data)
    const feeMessageData = JSON.parse(utf8String) as BroadcasterFeeMessageData
    const feeExpirationTime = new Date(feeMessageData.feeExpiration)
    if (isExpiredTimestamp(message.timestamp, feeExpirationTime)) {
      BroadcasterDebug.log("Skipping fee message. Timestamp Expired.")
      return
    }

    if (invalidBroadcasterVersion(feeMessageData.version)) {
      BroadcasterDebug.log(
        `Skipping Broadcaster outside version range: ${feeMessageData.version}, ${feeMessageData.railgunAddress}`,
      )
      return
    }

    // NB: signature verification is skipped — see file header.
    updateFeesForBroadcaster(chain, feeMessageData)
  } catch (cause) {
    if (!(cause instanceof Error)) {
      throw new Error("Unexpected non-error thrown", { cause })
    }
  }
}

const updateFeesForBroadcaster = (
  chain: Chain,
  feeMessageData: BroadcasterFeeMessageData,
) => {
  const tokenFeeMap: MapType<CachedTokenFee> = {}
  const tokenAddresses = Object.keys(feeMessageData.fees)

  let isTrustedSigner = false
  if (BroadcasterConfig.trustedFeeSigner) {
    if (typeof BroadcasterConfig.trustedFeeSigner === "string") {
      isTrustedSigner =
        feeMessageData.railgunAddress.toLowerCase() ===
        BroadcasterConfig.trustedFeeSigner.toLowerCase()
    } else {
      isTrustedSigner = BroadcasterConfig.trustedFeeSigner
        .map((s) => s.toLowerCase())
        .includes(feeMessageData.railgunAddress.toLowerCase())
    }
  }

  if (isTrustedSigner) {
    handleAuthorizedFees(feeMessageData, feeMessageData.railgunAddress)
  }

  tokenAddresses.forEach((tokenAddress) => {
    const feePerUnitGas = feeMessageData.fees[tokenAddress]
    if (feePerUnitGas) {
      if (!isTrustedSigner && BroadcasterConfig.trustedFeeSigner) {
        const authorizedFee = BroadcasterFeeCache.getAuthorizedFee(
          tokenAddress.toLowerCase(),
        )
        if (authorizedFee) {
          const authorizedFeeAmount = BigInt(authorizedFee.feePerUnitGas)
          const varianceLower =
            (authorizedFeeAmount *
              BigInt(
                Math.round(
                  BroadcasterConfig.authorizedFeeVariancePercentageLower * 100,
                ),
              )) /
            100n
          const varianceUpper =
            (authorizedFeeAmount *
              BigInt(
                Math.round(
                  BroadcasterConfig.authorizedFeeVariancePercentageUpper * 100,
                ),
              )) /
            100n
          const minFee = authorizedFeeAmount - varianceLower
          const maxFee = authorizedFeeAmount + varianceUpper

          const feeAmount = BigInt(feePerUnitGas)
          if (feeAmount < minFee || feeAmount > maxFee) {
            return
          }
        } else {
          return
        }
      }

      const cachedFee: CachedTokenFee = {
        feePerUnitGas,
        expiration: feeMessageData.feeExpiration,
        feesID: feeMessageData.feesID,
        availableWallets: feeMessageData.availableWallets,
        relayAdapt: feeMessageData.relayAdapt,
        reliability: feeMessageData.reliability,
      }
      tokenFeeMap[tokenAddress] = cachedFee
    }
  })

  if (Object.keys(tokenFeeMap).length > 0) {
    BroadcasterFeeCache.addTokenFees(
      chain,
      feeMessageData.railgunAddress,
      feeMessageData.feeExpiration,
      tokenFeeMap,
      feeMessageData.identifier,
      feeMessageData.version,
      feeMessageData.requiredPOIListKeys ?? [],
    )
  }
}
