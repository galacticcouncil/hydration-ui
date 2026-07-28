import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"

export type PropellerExchangeRateProps = {
  exchangeRate: number
}

// Vault shares (pETH/ptBTC) aren't registered substrate assets, so we render the
// switcher against the underlying collateral on both sides and feed the live
// vault `exchangeRate` (1 share = N collateral) through `fallbackPrice`.
export const PropellerExchangeRate: React.FC<PropellerExchangeRateProps> = ({
  exchangeRate,
}) => {
  const { assetId } = useActivePropellerVault()
  return (
    <AssetSwitcher
      assetInId={assetId}
      assetOutId={assetId}
      fallbackPrice={exchangeRate > 0 ? exchangeRate.toString() : undefined}
    />
  )
}
