import {
  HYDRATION_CHAIN_KEY,
  HYDRATION_PARACHAIN_ID,
} from "@galacticcouncil/utils"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { createXcSwap, XcSwapChain } from "@galacticcouncil/xc-swap"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { assetMetadataQuery } from "@/api/metadata"
import { XC_SWAP_CONFIG } from "@/config/xcSwap"
import { getXcSwapChainLogoUrl } from "@/modules/trade/swap/sections/XcSwap/config/meta"
import { addressValidatorForPlatform } from "@/modules/trade/swap/sections/XcSwap/lib/addressValidatorForPlatform"
import { XcChain } from "@/modules/trade/swap/sections/XcSwap/types"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useXcSwapClient = () => {
  const { sdk } = useRpcProvider()
  const { data: metadata } = useQuery(assetMetadataQuery())

  const xcSwap = useMemo(
    () =>
      createXcSwap({
        sdk,
        emitter: XC_SWAP_CONFIG.emitter,
      }),
    [sdk],
  )

  const chains = useMemo<Record<string, XcChain>>(() => {
    const hydrationLogo =
      metadata?.getChainLogoSrc(
        HYDRATION_PARACHAIN_ID,
        ChainEcosystem.Polkadot,
      ) ?? ""
    return Object.fromEntries(
      xcSwap.getChains().map((chain: XcSwapChain) => [
        chain.key,
        {
          key: chain.key,
          name: chain.name,
          logo:
            chain.platform === HYDRATION_CHAIN_KEY
              ? hydrationLogo
              : getXcSwapChainLogoUrl(chain.key),
          platform: chain.platform,
          addressValidator: addressValidatorForPlatform(chain.platform),
        },
      ]),
    )
  }, [xcSwap, metadata])

  return { xcSwap, chains }
}
