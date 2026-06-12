import {
  BIL_STABLESWAP_ASSET_ID,
  HOLLAR_ASSET_ID,
} from "@galacticcouncil/utils"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"

export type BilExchangeRateProps = {
  exchangeRate: number
}

export const BilExchangeRate: React.FC<BilExchangeRateProps> = ({
  exchangeRate,
}) => (
  <AssetSwitcher
    assetInId={BIL_STABLESWAP_ASSET_ID}
    assetOutId={HOLLAR_ASSET_ID}
    fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
  />
)
