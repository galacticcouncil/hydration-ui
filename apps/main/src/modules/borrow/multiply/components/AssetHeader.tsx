import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"

import { AssetLogo } from "@/components/AssetLogo"
import { MultiplyPageBackLink } from "@/modules/borrow/multiply/components/MultiplyPageBackLink"
import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"
import { useAssets } from "@/providers/assetsProvider"

type AssetHeaderProps = {
  collateralReserve: ComputedReserveData
  config: MultiplyAssetPairConfig
}

export const AssetHeader: React.FC<AssetHeaderProps> = ({
  collateralReserve,
  config,
}) => {
  const { getAsset, getRelatedAToken } = useAssets()

  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const asset = getAsset(assetId)
  const aToken = getRelatedAToken(assetId)

  if (!asset) return null

  const isEnteredWithDifferentAsset =
    !!aToken && !!config.enterWithAssetId && config.enterWithAssetId !== assetId

  const name = isEnteredWithDifferentAsset ? aToken.name : asset.name
  const symbol = isEnteredWithDifferentAsset ? aToken.symbol : asset.symbol
  const logoId = isEnteredWithDifferentAsset ? aToken.id : assetId

  const displayName = config.name ?? name

  return (
    <Flex align="center" gap="base">
      <MultiplyPageBackLink />
      <AssetLogo id={logoId} size="large" />
      <Stack>
        <Text fs="h7" lh={1.2} fw={500} font="primary">
          {displayName}
        </Text>
        {symbol && (
          <Text fs="p6" color={getToken("text.medium")}>
            {symbol}
          </Text>
        )}
      </Stack>
    </Flex>
  )
}
