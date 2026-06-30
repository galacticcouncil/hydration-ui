import { createXcSwap, XcSwapChain } from "@galacticcouncil/xc-swap"
import { useMemo } from "react"

import { getXcSwapChainLogoUrl, XC_SWAP_CONFIG } from "@/config/xcSwap"
import {
  addressValidatorFor,
  XcChain,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_ID } from "@/utils/consts"

export const useXcSwapClient = () => {
  const { sdk } = useRpcProvider()
  const { getAsset } = useAssets()

  const xcSwap = useMemo(
    () =>
      createXcSwap({
        sdk,
        emitter: XC_SWAP_CONFIG.emitter,
      }),
    [sdk],
  )

  const chains = useMemo<Record<string, XcChain>>(() => {
    const hydrationLogo = getAsset(NATIVE_ASSET_ID)?.iconSrc ?? ""
    return Object.fromEntries(
      xcSwap.getChains().map((chain: XcSwapChain) => [
        chain.key,
        {
          key: chain.key,
          name: chain.name,
          logo:
            chain.platform === "hydration"
              ? hydrationLogo
              : getXcSwapChainLogoUrl(chain.key),
          platform: chain.platform,
          addressValidator: addressValidatorFor(chain.platform),
        },
      ]),
    )
  }, [xcSwap, getAsset])

  return { xcSwap, chains }
}
