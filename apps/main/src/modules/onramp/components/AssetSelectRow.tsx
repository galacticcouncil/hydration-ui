import { Box, ButtonProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { AssetLogo } from "@/components/AssetLogo"
import { SAssetSelectRow } from "@/modules/onramp/components/AssetSelectRow.styled"
import { useAssets } from "@/providers/assetsProvider"

type AssetSelectRowProps = ButtonProps & {
  assetId: string
}
export const AssetSelectRow: React.FC<AssetSelectRowProps> = ({
  assetId,
  ...props
}) => {
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)
  return (
    <SAssetSelectRow {...props}>
      <AssetLogo id={asset.id} size="medium" />
      <Box>
        <Text fs={14} lh={1.2} fw={600}>
          {asset.symbol}
        </Text>
        <Text fs={11} color={getToken("text.medium")}>
          {asset.name}
        </Text>
      </Box>
    </SAssetSelectRow>
  )
}
