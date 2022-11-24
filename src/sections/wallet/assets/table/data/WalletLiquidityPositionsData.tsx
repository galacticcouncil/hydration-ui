import { DualAssetIcons } from "../../../../../components/DualAssetIcons/DualAssetIcons"
import { getAssetLogo } from "../../../../../components/AssetIcon/AssetIcon"

export const WalletLiquidityPositionsTableName = (props: {
  symbolA: string
  symbolB: string
}) => {
  return (
    <DualAssetIcons
      firstIcon={{
        icon: getAssetLogo(props.symbolA),
      }}
      secondIcon={{
        icon: getAssetLogo(props.symbolB),
      }}
    />
  )
}
