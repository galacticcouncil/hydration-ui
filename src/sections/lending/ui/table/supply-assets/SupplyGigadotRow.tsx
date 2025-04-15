import { FC, useMemo } from "react"
import { getAddressFromAssetId } from "utils/evm"
import { useAssets } from "providers/assets"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SupplyGigadotMobileRow } from "sections/lending/ui/table/supply-assets/SupplyGigadotMobileRow"
import { SupplyGigadotDesktopRow } from "sections/lending/ui/table/supply-assets/SupplyGigadotDesktopRow"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"

export type SupplyGigadotRowData = Pick<
  ComputedReserveData,
  "supplyAPY" | "aIncentivesData" | "symbol"
>

type Props = {
  // TODO skeleton
  readonly isLoading: boolean
  readonly onOpenSupply: (assetId: string) => void
}

export const SupplyGigadotRow: FC<Props> = ({ onOpenSupply }) => {
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(GDOT_ERC20_ASSET_ID)

  const { reserves } = useAppDataContext()
  const underlyingAssetAddress = getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID)

  const data = useMemo<SupplyGigadotRowData>(() => {
    const reserve = reserves.find(
      (reserve) => reserve.underlyingAsset === underlyingAssetAddress,
    )
    return {
      supplyAPY: reserve?.supplyAPY ?? "-1",
      aIncentivesData: reserve?.aIncentivesData ?? [],
      symbol: reserve?.symbol ?? "",
    }
  }, [reserves, underlyingAssetAddress])

  const isDesktop = useMedia(theme.viewport.gte.sm)

  if (!isDesktop) {
    return (
      <SupplyGigadotMobileRow
        data={data}
        onOpenSupply={() => onOpenSupply(asset.id)}
      />
    )
  }

  return (
    <SupplyGigadotDesktopRow
      data={data}
      gigadot={asset}
      onOpenSupply={() => onOpenSupply(asset.id)}
    />
  )
}
