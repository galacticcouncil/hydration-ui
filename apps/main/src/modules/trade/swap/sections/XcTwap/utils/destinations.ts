import { Destination } from "@galacticcouncil/xc-intents"

import { addressValidatorForPlatform } from "@/modules/trade/swap/sections/XcSwap/lib/addressValidatorForPlatform"
import { XcChainAssetPair } from "@/modules/trade/swap/sections/XcSwap/types"
import { XcPlatform } from "@/utils/trade"

type XcDestinationChain = {
  readonly platform: Exclude<XcPlatform, "hydration">
  readonly name: string
}

const XC_DESTINATION_CHAINS: Record<string, XcDestinationChain> = {
  ZEC: { platform: "zec", name: "Zcash" },
  BTC: { platform: "btc", name: "Bitcoin" },
  NEAR: { platform: "near", name: "NEAR" },
}

export type XcDestinationLogos = {
  readonly chain: (chainKey: string) => string
  readonly asset: (chainKey: string, symbol: string) => string
}

export const toXcDestinationPairs = (
  destinations: Destination[],
  logos: XcDestinationLogos,
): XcChainAssetPair[] =>
  destinations.flatMap((destination) => {
    const chain = XC_DESTINATION_CHAINS[destination.symbol]
    if (!chain) return []

    const { platform, name } = chain

    return {
      chain: {
        key: platform,
        name,
        platform,
        logo: logos.chain(platform),
        addressValidator: addressValidatorForPlatform(platform),
      },
      asset: {
        key: destination.asset,
        symbol: destination.symbol,
        name,
        decimals: destination.decimals,
        logo: logos.asset(platform, destination.symbol),
        chain: platform,
        oneClickId: destination.asset,
      },
    }
  })
