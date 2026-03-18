import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import {
  Flex,
  Icon,
  LOGO_SIZES,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"

import { AssetLogo } from "@/components/AssetLogo"
import { MULTIPLY_ASSETS_PAIRS } from "@/modules/borrow/multiply/config"
import { useAssets } from "@/providers/assetsProvider"

type AssetHeaderProps = {
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
}

export const AssetHeader: React.FC<AssetHeaderProps> = ({
  collateralReserve,
}) => {
  const { getAsset, getRelatedAToken } = useAssets()

  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const asset = getAsset(assetId)
  const aToken = getRelatedAToken(assetId)

  const strategy = asset
    ? MULTIPLY_ASSETS_PAIRS.find((s) => s.collateralAssetId === asset.id)
    : undefined

  if (!asset || !strategy) return null

  const logoId = aToken?.id || assetId

  const isEnteredWithDifferentAsset =
    !!aToken &&
    !!strategy?.enterWithAssetId &&
    strategy.enterWithAssetId !== assetId

  const hasNameOverride = !!strategy?.name

  const name = isEnteredWithDifferentAsset ? aToken.name : asset.name
  const symbol = isEnteredWithDifferentAsset ? aToken.symbol : asset.symbol

  const displayName = hasNameOverride ? strategy.name : name
  const displaySymbol = !hasNameOverride && symbol

  return (
    <Flex align="center" gap="m">
      {strategy?.icon ? (
        <Icon component={strategy.icon} size={LOGO_SIZES.large} />
      ) : (
        <AssetLogo id={logoId} size="large" />
      )}
      <Stack>
        <Text
          fs={hasNameOverride ? "h5" : "h7"}
          lh={1.2}
          fw={500}
          font="primary"
        >
          {displayName}
        </Text>
        {displaySymbol && (
          <Text fs="p6" color={getToken("text.medium")}>
            {displaySymbol}
          </Text>
        )}
      </Stack>
    </Flex>
  )
}
