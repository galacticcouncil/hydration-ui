import { useSearch } from "@tanstack/react-router"

import { AssetHeader } from "@/components/AssetHeader"
import { useAssets } from "@/providers/assetsProvider"

export const PageHeader = () => {
  const { getAsset } = useAssets()
  const { assetOut } = useSearch({ from: "/trade/_history" })

  const asset = getAsset(assetOut)

  if (!asset) return null

  return <AssetHeader asset={asset} />
}
