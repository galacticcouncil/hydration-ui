import Big from "big.js"
import { FC, useMemo } from "react"
import { useFormContext } from "react-hook-form"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import type { StableBondsFormValues } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import { useStableBondsOtcOrders } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.query"
import { STABLE_BONDS_ASSET_ID } from "@/modules/strategies/stable-bonds/constants"
import { useAssets } from "@/providers/assetsProvider"

export const StableBondsAssetSwitcher: FC = () => {
  const { watch } = useFormContext<StableBondsFormValues>()
  const { getAssetWithFallback } = useAssets()
  const depositAsset = watch("depositAsset")

  const { data: otcOrders = [], isLoading: isOrdersLoading } =
    useStableBondsOtcOrders()

  const selectedOrder = useMemo(
    () => otcOrders.find((order) => order.assetIn.id === depositAsset?.id),
    [depositAsset?.id, otcOrders],
  )

  const depositAssetId = selectedOrder?.assetIn.id ?? ""
  const receiveAsset =
    selectedOrder?.assetOut ?? getAssetWithFallback(STABLE_BONDS_ASSET_ID)

  const fallbackPrice = selectedOrder
    ? Big(selectedOrder.assetAmountOut)
        .div(selectedOrder.assetAmountIn)
        .toString()
    : undefined

  return (
    <AssetSwitcher
      assetInId={depositAssetId}
      assetOutId={receiveAsset.id}
      fallbackPrice={fallbackPrice}
      isFallbackPriceLoading={isOrdersLoading}
    />
  )
}
