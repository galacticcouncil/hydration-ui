import { Box } from "@galacticcouncil/ui/components"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useNavigate } from "@tanstack/react-router"
import { FC, useEffect, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { DcaAssetSwitcher } from "@/modules/trade/swap/sections/DCA/DcaAssetSwitcher"
import { DcaLimitedBudgetFields } from "@/modules/trade/swap/sections/DCA/DcaLimitedBudgetFields"
import { DcaOpenBudgetFields } from "@/modules/trade/swap/sections/DCA/DcaOpenBudgetFields"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import {
  DEFAULT_TRADE_ASSET_IN_ID,
  DEFAULT_TRADE_ASSET_OUT_ID,
} from "@/routes/trade/_history/route"

export const DcaForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { control, getValues, setValue, reset, trigger, watch } =
    useFormContext<DcaFormValues>()

  const isOpenBudget = watch("orders.type") === DcaOrdersMode.OpenBudget

  const { tradable, getAsset } = useAssets()
  const switchAssets = useSwitchAssets()

  const navigate = useNavigate()

  const buyableAssets = useMemo(
    () => tradable.filter((asset) => !SELL_ONLY_ASSETS.includes(asset.id)),
    [tradable],
  )

  useEffect(() => {
    const { sellAsset, buyAsset, ...values } = getValues()

    if (!sellAsset || !buyAsset) {
      reset({
        ...values,
        sellAsset: getAsset(DEFAULT_TRADE_ASSET_IN_ID),
        buyAsset: getAsset(DEFAULT_TRADE_ASSET_OUT_ID),
      })

      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: DEFAULT_TRADE_ASSET_IN_ID,
          assetOut: DEFAULT_TRADE_ASSET_OUT_ID,
        }),
        resetScroll: false,
      })
    }
  }, [getValues, reset, getAsset, navigate])

  const handleSellAssetChange = (
    sellAsset: TAsset,
    previousSellAsset: TAsset | null,
  ): void => {
    const { buyAsset } = getValues()

    if (sellAsset.id !== buyAsset?.id) {
      trigger("sellAmount")

      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: sellAsset.id,
          assetOut: buyAsset?.id,
        }),
        resetScroll: false,
      })

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
      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: sellAsset?.id,
          assetOut: buyAsset.id,
        }),
        resetScroll: false,
      })

      return
    }

    setValue("buyAsset", previousBuyAsset)
    switchAssets.mutate()
  }

  return (
    <Box>
      <AssetSelectFormField<DcaFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        assets={tradable}
        label={
          isOpenBudget
            ? t("trade:dca.assetIn.title.open")
            : t("trade:dca.assetIn.title")
        }
        maxBalanceFallback="0"
        onAssetChange={handleSellAssetChange}
      />
      <DcaAssetSwitcher />
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
            assets={buyableAssets}
            label={t("trade:dca.assetOut.title")}
            hideInput
            ignoreBalance
            assetError={fieldState.error?.message}
          />
        )}
      />
      <SwapSectionSeparator />
      {isOpenBudget ? <DcaOpenBudgetFields /> : <DcaLimitedBudgetFields />}
    </Box>
  )
}
