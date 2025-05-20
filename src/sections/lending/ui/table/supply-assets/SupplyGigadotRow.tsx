import { FC } from "react"
import { useAssets } from "providers/assets"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SupplyGigadotMobileRow } from "sections/lending/ui/table/supply-assets/SupplyGigadotMobileRow"
import { SupplyGigadotDesktopRow } from "sections/lending/ui/table/supply-assets/SupplyGigadotDesktopRow"
import { GDOT_ERC20_ASSET_ID } from "utils/constants"

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

  const isDesktop = useMedia(theme.viewport.gte.sm)

  if (!isDesktop) {
    return (
      <SupplyGigadotMobileRow onOpenSupply={() => onOpenSupply(asset.id)} />
    )
  }

  return (
    <SupplyGigadotDesktopRow
      gigadot={asset}
      onOpenSupply={() => onOpenSupply(asset.id)}
    />
  )
}
