import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { ETH_ASSET_ID } from "@/modules/strategies/propeller/constants"

export type PropellerExchangeRateProps = {
  exchangeRate: number
}

// pETH (vault shares) isn't a registered substrate asset, so we render the
// switcher against the underlying ETH on both sides and feed the live vault
// `exchangeRate` (1 pETH = N ETH) through `fallbackPrice`.
export const PropellerExchangeRate: React.FC<PropellerExchangeRateProps> = ({
  exchangeRate,
}) => (
  <AssetSwitcher
    assetInId={ETH_ASSET_ID}
    assetOutId={ETH_ASSET_ID}
    fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
  />
)
