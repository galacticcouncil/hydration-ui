import {
  FieldPathByValue,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form"

import {
  XcChainAssetSelect,
  XcChainAssetSelectProps,
} from "@/modules/trade/swap/sections/XcSwap/components/XcChainAssetSelect/XcChainAssetSelect"
import {
  XcAsset,
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"

type Props<TFormValues extends FieldValues> = Omit<
  XcChainAssetSelectProps,
  | "selectedChain"
  | "selectedAsset"
  | "value"
  | "onChange"
  | "assetError"
  | "amountError"
  | "onSelectionChange"
> & {
  readonly chainFieldName: FieldPathByValue<TFormValues, XcChain | null>
  readonly assetFieldName: FieldPathByValue<TFormValues, XcAsset | null>
  readonly amountFieldName: FieldPathByValue<TFormValues, string>
  readonly onSelectionChange?: (
    selection: XcChainAssetPair,
    previousSelection: XcChainAssetPair,
  ) => void
  readonly onAmountChange?: (amount: string) => void
  readonly disabledAssetSelector?: boolean
  readonly ignoreErrors?: boolean
}

export const XcChainAssetSelectFormField = <TFormValues extends FieldValues>({
  chainFieldName,
  assetFieldName,
  amountFieldName,
  onSelectionChange,
  onAmountChange,
  disabledAssetSelector = false,
  ignoreErrors = false,
  ...assetSelectProps
}: Props<TFormValues>) => {
  const { control } = useFormContext<TFormValues>()

  const { field: chainField } = useController({
    control,
    name: chainFieldName,
  })
  const { field: assetField, fieldState: assetFieldState } = useController({
    control,
    name: assetFieldName,
    disabled: disabledAssetSelector,
  })
  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: amountFieldName,
  })

  const handleSelectionChange = (selection: XcChainAssetPair) => {
    const previousSelection = {
      chain: chainField.value,
      asset: assetField.value,
    }

    if (!disabledAssetSelector) {
      chainField.onChange(selection.chain)
      assetField.onChange(selection.asset)
    }

    onSelectionChange?.(selection, previousSelection)
  }

  return (
    <XcChainAssetSelect
      {...assetSelectProps}
      selectedChain={chainField.value}
      selectedAsset={assetField.value}
      value={amountField.value}
      onChange={(value) => {
        amountField.onChange(value)
        onAmountChange?.(value)
      }}
      assetError={ignoreErrors ? undefined : assetFieldState.error?.message}
      amountError={ignoreErrors ? undefined : amountFieldState.error?.message}
      disabledAssetSelector={disabledAssetSelector}
      onSelectionChange={handleSelectionChange}
    />
  )
}
