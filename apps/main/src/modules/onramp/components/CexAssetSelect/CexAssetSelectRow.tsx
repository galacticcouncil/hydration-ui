import { AssetLabel, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"

import { SRow } from "./CexAssetSelectRow.styled"

type CexAssetSelectRowProps = {
  onClick: () => void
  assetId: string
  showBalance?: boolean
}
export const CexAssetSelectRow: React.FC<CexAssetSelectRowProps> = ({
  assetId,
  showBalance = false,
  ...props
}) => {
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)
  return (
    <SRow {...props}>
      <Flex gap="m" align="center" flex={1} minWidth={0}>
        <AssetLogo id={asset.id} size="medium" />
        <AssetLabel symbol={asset.symbol} name={asset.name} />
      </Flex>
      {showBalance && (
        <Text fs="p5" color={getToken("text.low")}>
          —
        </Text>
      )}
    </SRow>
  )
}
