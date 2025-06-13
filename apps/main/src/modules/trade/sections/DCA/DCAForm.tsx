import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { PeriodInput } from "@/components/PeriodInput/PeriodInput"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useOwnedAssets } from "@/hooks/data/useOwnedAssets"
import { DcaAssetSwitcher } from "@/modules/trade/sections/DCA/DcaAssetSwitcher"
import { DcaFormValues } from "@/modules/trade/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/sections/DCA/useSwitchAssets"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
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

  return (
    <div>
      <AssetSelectFormField<DcaFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        assets={ownedAssets}
        onAssetChange={(sellAsset, previousSellAsset) => {
          const { buyAsset } = getValues()

          if (sellAsset.id !== buyAsset?.id) {
            return
          }

          setValue("sellAsset", previousSellAsset)
          switchAssets.mutate()
        }}
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

              const previousBuyAsset = field.value
              const { sellAsset } = getValues()

              if (buyAsset.id !== sellAsset?.id) {
                return
              }

              setValue("buyAsset", previousBuyAsset)
              switchAssets.mutate()
            }}
            assets={tradable}
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
      <Controller
        control={control}
        name="interval"
        render={({ field }) => (
          <PeriodInput
            label={t("trade:dca.interval.label")}
            period={field.value}
            onPeriodChange={field.onChange}
          />
        )}
      />
    </div>
  )
}
