import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"

import { AssetHeader } from "@/components/AssetHeader"
import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { useXcDestinationAsset } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcDestinationAsset"
import { useAssets } from "@/providers/assetsProvider"

export const PageHeader = () => {
  const { getAsset } = useAssets()
  const { assetOut, destPlatform } = useSearch({ from: "/trade/_history" })

  const destAsset = useXcDestinationAsset(assetOut)
  if (destPlatform !== HYDRATION_CHAIN_KEY && destAsset) {
    return (
      <Flex gap="base">
        <XcLogo src={destAsset.logo} size="large" />
        <Stack>
          <Text fs="h7" lh={1} fw={600} font="primary">
            {destAsset.name}
          </Text>
          <Text fs="p6" color={getToken("text.medium")}>
            {destAsset.symbol}
          </Text>
        </Stack>
      </Flex>
    )
  }

  const asset = getAsset(assetOut)

  if (!asset) return null

  return <AssetHeader asset={asset} />
}
