import { Box } from "@galacticcouncil/ui/components"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { DcaAssetSwitcher } from "@/modules/trade/swap/sections/DCA/DcaAssetSwitcher"
import { DcaDurationField } from "@/modules/trade/swap/sections/DCA/DcaDurationField"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { isErc20AToken, TAsset, useAssets } from "@/providers/assetsProvider"

export const DcaForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { control, getValues, setValue } = useFormContext<DcaFormValues>()

  const { tradable } = useAssets()
  const switchAssets = useSwitchAssets()

  const navigate = useNavigate()
  const search = useSearch({ from: "/trade/_history" })

  const buyableAssets = useMemo(
    () =>
      tradable
        .filter((asset) => !SELL_ONLY_ASSETS.includes(asset.id))
        .filter(noATokens),
    [tradable],
  )

  const handlesellAssetChange = (
    sellAsset: TAsset,
    previousSellAsset: TAsset | null,
  ): void => {
    const { buyAsset } = getValues()

    if (sellAsset.id !== buyAsset?.id) {
      navigate({
        to: ".",
        search: {
          ...search,
          assetIn: sellAsset.id,
          assetOut: buyAsset?.id,
        },
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
        search: { ...search, assetIn: sellAsset?.id, assetOut: buyAsset.id },
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
        assets={useMemo(() => tradable.filter(noATokens), [tradable])}
        label={t("trade:dca.assetIn.title")}
        maxBalanceFallback="0"
        onAssetChange={handlesellAssetChange}
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
      <DcaDurationField />
    </Box>
  )
}

// TODO remove filter once runtime is fixed
const noATokens = (asset: TAsset): boolean => !isErc20AToken(asset)
