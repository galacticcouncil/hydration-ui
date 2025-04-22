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
  "selectedAsset" | "setSelectedAsset" | "value" | "onChange"
> & {
  readonly assetFieldName: FieldPathByValue<TFormValues, TAsset | null>
  readonly amountFieldName: FieldPathByValue<TFormValues, string>
}

export const AssetSelectFormField = <TFormValues extends FieldValues>({
  assetFieldName,
  amountFieldName,
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
      setSelectedAsset={assetField.onChange}
      value={amountField.value}
      onChange={amountField.onChange}
      error={assetFieldState.error?.message ?? amountFieldState.error?.message}
    />
  )
}
