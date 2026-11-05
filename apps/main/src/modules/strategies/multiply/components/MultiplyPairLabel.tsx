import { AssetLabel } from "@galacticcouncil/ui/components"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useAssets } from "@/providers/assetsProvider"

export const MultiplyPairLabel: React.FC<{
  pair: MultiplyPair
  size?: "small" | "medium"
}> = ({ pair, size = "medium" }) => {
  const { getAssetWithFallback } = useAssets()
  const collateral = getAssetWithFallback(pair.collateralAssetId).symbol
  const debt = getAssetWithFallback(pair.debtAssetId).symbol

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={[pair.collateralAssetId, pair.debtAssetId]} size={size} />
      <AssetLabel symbol={`${collateral}/${debt}`} />
    </AssetLabelFullContainer>
  )
}
