import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { PeriodFormField } from "@/form/PeriodFormField"
import { useOwnedAssets } from "@/hooks/data/useOwnedAssets"
import { DcaAssetSwitcher } from "@/modules/trade/swap/sections/DCA/DcaAssetSwitcher"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined
}

export const DcaForm: FC<Props> = ({ order }) => {
  const { t } = useTranslation(["common", "trade"])
  const { control, getValues, setValue } = useFormContext<DcaFormValues>()

  const { tradable } = useAssets()
  const ownedAssets = useOwnedAssets()
  const switchAssets = useSwitchAssets()

  const handlesellAssetChange = (
    sellAsset: TAsset,
    previousSellAsset: TAsset | null,
  ): void => {
    const { buyAsset } = getValues()

    if (sellAsset.id !== buyAsset?.id) {
      return
    }

    setValue("sellAsset", previousSellAsset)
    switchAssets.mutate()
  }

  const handleBuyAssetChange = (
    buyAsset: TAsset,
    previousBuyAsset: TAsset | null,
  ): void => {
    const { sellAsset } = getValues()

    if (buyAsset.id !== sellAsset?.id) {
      return
    }

    setValue("buyAsset", previousBuyAsset)
    switchAssets.mutate()
  }

  return (
    <div>
      <AssetSelectFormField<DcaFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        assets={ownedAssets}
        label={t("trade:dca.assetIn.title")}
        onAssetChange={handlesellAssetChange}
      />
      <DcaAssetSwitcher order={order} />
      <Controller
        control={control}
        name="buyAsset"
        render={({ field, fieldState }) => (
          <AssetSelect
            selectedAsset={field.value}
            setSelectedAsset={(buyAsset) => {
              field.onChange(buyAsset)
              handleBuyAssetChange(buyAsset, field.value)
            }}
            assets={tradable}
            label={t("trade:dca.assetOu.title")}
            ignoreBalance
            value={
              field.value
                ? scaleHuman(order?.amountOut || "0", field.value.decimals)
                : "0"
            }
            error={fieldState.error?.message}
          />
        )}
      />

      <SwapSectionSeparator />
      <PeriodFormField
        typeName="period.type"
        valueName="period.value"
        label={t("trade:dca.interval.label")}
      />
    </div>
  )
}
