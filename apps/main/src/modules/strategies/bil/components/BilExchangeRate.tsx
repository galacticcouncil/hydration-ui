import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { BIL_ASSET_ID } from "@/modules/strategies/bil/constants"

export type BilExchangeRateProps = {
  exchangeRate: number
}

export const BilExchangeRate: React.FC<BilExchangeRateProps> = ({
  exchangeRate,
}) => (
  <AssetSwitcher
    assetInId={BIL_ASSET_ID}
    assetOutId={HOLLAR_ASSET_ID}
    fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
  />
)
