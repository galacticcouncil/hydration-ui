import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useMemo } from "react"

import { useCrossChainConfigService, useHydrationAssetId } from "@/api/xcm"
import {
  getWithdrawDestinationOptions,
  WithdrawDestinationOption,
} from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { XCM_CHAINS } from "@/modules/xcm/transfer/utils/chain"
import { useAssets } from "@/providers/assetsProvider"

export const useWithdrawDestinationOptions =
  (): WithdrawDestinationOption[] => {
    const configService = useCrossChainConfigService()
    const getHydrationAssetId = useHydrationAssetId()
    const { getAsset } = useAssets()

    return useMemo(() => {
      const supportedChainKeys = new Set(XCM_CHAINS.map((chain) => chain.key))
      const hydration = configService.chains.get(HYDRATION_CHAIN_KEY)
      const localTransfers = hydration
        ? [...hydration.assetsData.values()].map(({ asset }) => ({
            sourceAsset: asset,
            destinationChain: hydration,
            destinationAsset: asset,
          }))
        : []
      const configured = (
        configService.routes.get(HYDRATION_CHAIN_KEY)?.getRoutes() ?? []
      ).map((route) => ({
        sourceAsset: route.source.asset,
        destinationChain: route.destination.chain,
        destinationAsset: route.destination.asset,
        route,
      }))

      return getWithdrawDestinationOptions(
        [...localTransfers, ...configured],
        (asset) => getHydrationAssetId(asset, HYDRATION_CHAIN_KEY),
        supportedChainKeys,
      ).filter((option) => !!getAsset(option.assetId))
    }, [configService, getAsset, getHydrationAssetId])
  }
