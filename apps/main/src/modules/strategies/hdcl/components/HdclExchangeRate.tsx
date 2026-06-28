import { HDCL_ERC20_ID, HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"

export type HdclExchangeRateProps = {
  exchangeRate: number
}

export const HdclExchangeRate: React.FC<HdclExchangeRateProps> = ({
  exchangeRate,
}) => (
  <AssetSwitcher
    assetInId={HDCL_ERC20_ID}
    assetOutId={HOLLAR_ASSET_ID}
    fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
  />
)
