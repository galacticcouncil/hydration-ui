import {
  FieldPathByValue,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form"

import {
  AssetSelect,
  AssetSelectProps,
} from "@/components/AssetSelect/AssetSelect"
import { TAsset } from "@/providers/assetsProvider"

type Props<TFormValues extends FieldValues> = Omit<
  AssetSelectProps,
  "selectedAsset" | "setSelectedAsset" | "value" | "onChange" | "error"
> & {
  readonly assetFieldName: FieldPathByValue<TFormValues, TAsset | null>
  readonly amountFieldName: FieldPathByValue<TFormValues, string>
  readonly onAssetChange?: (asset: TAsset) => void
  readonly onAmountChange?: (amount: string) => void
}

export const AssetSelectFormField = <TFormValues extends FieldValues>({
  assetFieldName,
  amountFieldName,
  onAssetChange,
  onAmountChange,
  ...assetSelectProps
}: Props<TFormValues>) => {
  const { control } = useFormContext<TFormValues>()
  const { field: assetField, fieldState: assetFieldState } = useController({
    control,
    name: assetFieldName,
  })
  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: amountFieldName,
  })

  return (
    <AssetSelect
      {...assetSelectProps}
      selectedAsset={assetField.value}
      setSelectedAsset={(asset) => {
        assetField.onChange(asset)
        onAssetChange?.(asset)
      }}
      value={amountField.value}
      onChange={(value) => {
        amountField.onChange(value)
        onAmountChange?.(value)
      }}
      error={assetFieldState.error?.message ?? amountFieldState.error?.message}
    />
  )
}
