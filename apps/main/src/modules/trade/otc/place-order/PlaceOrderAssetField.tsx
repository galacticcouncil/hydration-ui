import { FC } from "react"
import { Controller, FieldPathByValue } from "react-hook-form"

import { TAssetData } from "@/api/assets"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly label: string
  readonly maxBalance: string
  readonly assetIdFieldName: FieldPathByValue<PlaceOrderFormValues, string>
  readonly assetAmountFieldName: FieldPathByValue<PlaceOrderFormValues, string>
  readonly assets: Array<TAssetData>
}

export const PlaceOrderAssetField: FC<Props> = ({
  label,
  maxBalance,
  assetIdFieldName,
  assetAmountFieldName,
  assets,
}) => {
  const { getAsset } = useAssets()

  return (
    <Controller<
      PlaceOrderFormValues,
      FieldPathByValue<PlaceOrderFormValues, string>
    >
      name={assetIdFieldName}
      render={({ field: assetIdField, fieldState: assetIdFieldState }) => (
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
              selectedAsset={getAsset(assetIdField.value)}
              setSelectedAsset={(asset) => assetIdField.onChange(asset.id)}
              onChange={assetAmountField.onChange}
              error={
                assetIdFieldState.error?.message ??
                assetAmountFieldState.error?.message
              }
            />
          )}
        />
      )}
    />
  )
}
