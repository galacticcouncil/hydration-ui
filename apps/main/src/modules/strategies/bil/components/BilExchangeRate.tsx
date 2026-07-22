import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { useBilStrategy } from "@/modules/strategies/bil/BilStrategyProvider"

export type BilExchangeRateProps = {
  exchangeRate: number
}

// Rate is quoted in BIL (asset 55, what users actually hold) — not uBIL
// (asset 550, the internal unwrapped share). Same rate either way (the
// aToken wraps the share 1:1), but uBIL is an implementation detail that
// shouldn't leak into the deposit panel.
export const BilExchangeRate: React.FC<BilExchangeRateProps> = ({
  exchangeRate,
}) => {
  const { bil, hollar } = useBilStrategy()
  return (
    <AssetSwitcher
      assetInId={bil.id}
      assetOutId={hollar.id}
      fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
    />
  )
}
