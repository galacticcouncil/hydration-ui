import {
  HDCL_STABLESWAP_ASSET_ID,
  HOLLAR_ASSET_ID,
} from "@galacticcouncil/utils"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"

export type HdclExchangeRateProps = {
  exchangeRate: number
}

export const HdclExchangeRate: React.FC<HdclExchangeRateProps> = ({
  exchangeRate,
}) => (
  <AssetSwitcher
    assetInId={HDCL_STABLESWAP_ASSET_ID}
    assetOutId={HOLLAR_ASSET_ID}
    fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
  />
)
