import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"

import { AssetHeader } from "@/components/AssetHeader"
import { getXcSwapAssetLogoUrl, XC_SWAP_ASSET_META } from "@/config/xcSwap"
import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { useAssets } from "@/providers/assetsProvider"

export const PageHeader = () => {
  const { getAsset } = useAssets()
  const { assetOut, destPlatform } = useSearch({ from: "/trade/_history" })

  const destMeta = XC_SWAP_ASSET_META[assetOut]
  if (destPlatform !== HYDRATION_CHAIN_KEY && destMeta) {
    return (
      <Flex gap="base">
        <XcLogo src={getXcSwapAssetLogoUrl(assetOut)} size="large" />
        <Stack>
          <Text fs="h7" lh={1} fw={600} font="primary">
            {destMeta.name}
          </Text>
          <Text fs="p6" color={getToken("text.medium")}>
            {destMeta.symbol}
          </Text>
        </Stack>
      </Flex>
    )
  }

  const asset = getAsset(assetOut)

  if (!asset) return null

  return <AssetHeader asset={asset} />
}
