import { FC } from "react"
import { Controller, FieldPathByValue } from "react-hook-form"

import { TAssetData } from "@/api/assets"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"

type Props = {
  readonly label: string
  readonly maxBalance?: string
  readonly assetFieldName: FieldPathByValue<
    PlaceOrderFormValues,
    TAssetData | null
  >
  readonly assetAmountFieldName: FieldPathByValue<PlaceOrderFormValues, string>
  readonly assets: Array<TAssetData>
}

export const PlaceOrderAssetField: FC<Props> = ({
  label,
  maxBalance,
  assetFieldName,
  assetAmountFieldName,
  assets,
}) => {
  return (
    <Controller<
      PlaceOrderFormValues,
      FieldPathByValue<PlaceOrderFormValues, TAssetData | null>
    >
      name={assetFieldName}
      render={({ field: assetField, fieldState: assetFieldState }) => (
        <Controller<
          PlaceOrderFormValues,
          FieldPathByValue<PlaceOrderFormValues, string>
        >
          name={assetAmountFieldName}
          render={({
            field: assetAmountField,
            fieldState: assetAmountFieldState,
          }) => (
            <AssetSelect
              label={label}
              assets={assets}
              value={assetAmountField.value}
              maxBalance={maxBalance}
              selectedAsset={assetField.value}
              setSelectedAsset={(asset) => assetField.onChange(asset)}
              onChange={assetAmountField.onChange}
              error={
                assetFieldState.error?.message ??
                assetAmountFieldState.error?.message
              }
            />
          )}
        />
      )}
    />
  )
}
