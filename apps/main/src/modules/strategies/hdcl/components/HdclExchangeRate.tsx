import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { HDCL_ASSET_ID } from "@/modules/strategies/hdcl/constants"

export type HdclExchangeRateProps = {
  exchangeRate: number
}

export const HdclExchangeRate: React.FC<HdclExchangeRateProps> = ({
  exchangeRate,
}) => (
  <AssetSwitcher
    assetInId={HDCL_ASSET_ID}
    assetOutId={HOLLAR_ASSET_ID}
    fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
  />
)
