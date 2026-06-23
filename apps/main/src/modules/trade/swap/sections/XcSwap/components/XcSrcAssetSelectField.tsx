import { ReactNode } from "react"
import { useController, useFormContext } from "react-hook-form"

import { TAssetData } from "@/api/assets"
import {
  AssetSelect,
  TSelectedAsset,
} from "@/components/AssetSelect/AssetSelect"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly label: ReactNode
  readonly loading?: boolean
  readonly onAssetChange?: (
    asset: TAssetData,
    previousAsset: TAssetData | null,
  ) => void
}

export const XcSrcAssetSelectField: React.FC<Props> = ({
  label,
  loading,
  onAssetChange,
}) => {
  const { tradable } = useAssets()
  const { control } = useFormContext<XcSwapFormValues>()

  const { field: assetField, fieldState: assetFieldState } = useController({
    control,
    name: "sellAsset",
  })
  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: "sellAmount",
  })

  const sellAsset = assetField.value
  const selectedAsset: TSelectedAsset | null = sellAsset
    ? {
        id: sellAsset.id,
        iconId: sellAsset.id,
        symbol: sellAsset.symbol,
        decimals: sellAsset.decimals,
      }
    : null

  return (
    <AssetSelect
      label={label}
      assets={tradable}
      selectedAsset={selectedAsset}
      setSelectedAsset={(asset) => {
        const previousAsset = sellAsset
        assetField.onChange(asset)
        onAssetChange?.(asset, previousAsset)
      }}
      value={amountField.value}
      onChange={amountField.onChange}
      assetError={assetFieldState.error?.message}
      amountError={amountFieldState.error?.message}
      maxBalanceFallback="0"
      loading={loading}
    />
  )
}
