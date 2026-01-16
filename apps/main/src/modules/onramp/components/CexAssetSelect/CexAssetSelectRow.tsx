import { Box, ButtonProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"

import { SRow } from "./CexAssetSelectRow.styled"

type CexAssetSelectRowProps = ButtonProps & {
  assetId: string
}
export const CexAssetSelectRow: React.FC<CexAssetSelectRowProps> = ({
  assetId,
  ...props
}) => {
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)
  return (
    <SRow {...props}>
      <AssetLogo id={asset.id} size="medium" />
      <Box>
        <Text fs={14} lh={1.2} fw={600}>
          {asset.symbol}
        </Text>
        <Text fs={11} color={getToken("text.medium")}>
          {asset.name}
        </Text>
      </Box>
    </SRow>
  )
}
