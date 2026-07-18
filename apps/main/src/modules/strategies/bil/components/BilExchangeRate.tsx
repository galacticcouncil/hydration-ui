import { BIL_ERC20_ID, HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"

export type BilExchangeRateProps = {
  exchangeRate: number
}

// Rate is quoted in BIL (asset 55, what users actually hold) — not uBIL
// (asset 550, the internal unwrapped share). Same rate either way (the
// aToken wraps the share 1:1), but uBIL is an implementation detail that
// shouldn't leak into the deposit panel.
export const BilExchangeRate: React.FC<BilExchangeRateProps> = ({
  exchangeRate,
}) => (
  <AssetSwitcher
    assetInId={BIL_ERC20_ID}
    assetOutId={HOLLAR_ASSET_ID}
    fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
  />
)
