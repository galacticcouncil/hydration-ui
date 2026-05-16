// Vendored verbatim from upstream
// `packages/common/src/fees/handle-authorized-fees-message.ts`.
import {
  BroadcasterFeeMessageData,
  CachedTokenFee,
} from "../shared-models-shim.js"
import { BroadcasterDebug } from "../utils/broadcaster-debug.js"
import { BroadcasterFeeCache } from "./broadcaster-fee-cache.js"
import { cachedFeeExpired } from "../utils/broadcaster-util.js"

export const handleAuthorizedFees = (
  feeMessageData: BroadcasterFeeMessageData,
  signerAddress: string,
) => {
  try {
    if (cachedFeeExpired(feeMessageData.feeExpiration)) {
      return
    }

    const tokenFeeMap: MapType<CachedTokenFee> = {}
    const tokenAddresses = Object.keys(feeMessageData.fees)
    tokenAddresses.forEach((tokenAddress) => {
      const feePerUnitGas = feeMessageData.fees[tokenAddress]
      if (feePerUnitGas) {
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
      BroadcasterFeeCache.addAuthorizedFees(signerAddress, tokenFeeMap)
      BroadcasterDebug.log("Updated Authorized Fees")
    }
  } catch (err) {
    BroadcasterDebug.error(err as Error)
  }
}
