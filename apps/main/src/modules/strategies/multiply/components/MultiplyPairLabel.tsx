import { AssetLabel } from "@galacticcouncil/ui/components"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"

export const MultiplyPairLabel: React.FC<{
  pair: MultiplyPair
  size?: "small" | "medium"
}> = ({ pair, size = "medium" }) => {
  const display = useResolveAssetDisplay()
  const collateral = display(pair.collateralAssetId)
  const debt = display(pair.debtAssetId)

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={[collateral.logoId, debt.logoId]} size={size} collapsed />
      <AssetLabel symbol={`${collateral.symbol}/${debt.symbol}`} />
    </AssetLabelFullContainer>
  )
}
