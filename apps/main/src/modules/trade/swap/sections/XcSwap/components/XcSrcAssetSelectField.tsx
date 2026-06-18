import { ReactNode } from "react"
import { useController, useFormContext } from "react-hook-form"

import { TAssetData } from "@/api/assets"
import {
  AssetSelect,
  TSelectedAsset,
} from "@/components/AssetSelect/AssetSelect"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly label: ReactNode
  readonly loading?: boolean
}

// Source picker for XcSwap. Uses Market's AssetSelect UI (full tradable list,
// native MAX balance + $ display) but keeps the form value as an XcAsset:
// the picked TAssetData id is resolved back to an origin XcAsset via the map.
export const XcSrcAssetSelectField: React.FC<Props> = ({ label, loading }) => {
  const { tradable } = useAssets()
  const { originAssetMap } = useXcSwap()
  const { control } = useFormContext<XcSwapFormValues>()

  const { field: assetField, fieldState: assetFieldState } = useController({
    control,
    name: "srcAsset",
  })
  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: "srcAmount",
  })

  const xcAsset = assetField.value
  const selectedAsset: TSelectedAsset | null = xcAsset
    ? {
        id: String(xcAsset.id),
        iconId: String(xcAsset.id),
        symbol: xcAsset.symbol,
        decimals: xcAsset.decimals,
      }
    : null

  const setSelectedAsset = (asset: TAssetData) => {
    // Resolve to an origin XcAsset; on a map miss keep the clicked asset
    // visible — the provider pushes the blocking "unsupported" alert.
    const resolved =
      originAssetMap.get(asset.id) ??
      ({
        key: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        decimals: asset.decimals,
        logo: asset.iconSrc ?? "",
        id: Number(asset.id),
      } satisfies XcAsset)
    assetField.onChange(resolved)
  }

  return (
    <AssetSelect
      label={label}
      assets={tradable}
      selectedAsset={selectedAsset}
      setSelectedAsset={setSelectedAsset}
      value={amountField.value}
      onChange={amountField.onChange}
      assetError={assetFieldState.error?.message}
      amountError={amountFieldState.error?.message}
      maxBalanceFallback="0"
      loading={loading}
    />
  )
}
