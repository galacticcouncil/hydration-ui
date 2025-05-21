import { Grid } from "@galacticcouncil/ui/components"
import { Navigate } from "@tanstack/react-router"
import { FC } from "react"

import { AssetLabelFull } from "@/components"
import { LINKS } from "@/config/navigation"
import { useAssets } from "@/providers/assetsProvider"

export type BorrowMarketDetailPageProps = {
  assetId: string
}

export const BorrowMarketDetailPage: FC<BorrowMarketDetailPageProps> = ({
  assetId,
}) => {
  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  if (!asset) return <Navigate to={LINKS.borrowMarkets} />

  return (
    <Grid py={20}>
      <AssetLabelFull asset={asset} />
    </Grid>
  )
}
