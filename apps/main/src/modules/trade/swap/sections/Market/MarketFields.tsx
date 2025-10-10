import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebouncedCallback } from "use-debounce"

import { TradeType } from "@/api/trade"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useCalculateBuyAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateBuyAmount"
import { useCalculateSellAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateSellAmount"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"
import { MarketSwitcher } from "@/modules/trade/swap/sections/Market/MarketSwitcher"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { SELL_ONLY_ASSETS } from "@/utils/consts"

const RECALCULATE_DEBOUNCE_MS = 250

export const MarketFields: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { tradable } = useAssets()

  const navigate = useNavigate()
  const search = useSearch({ from: "/trade/_history" })

  const { reset, getValues, setValue, trigger } =
    useFormContext<MarketFormValues>()

  const switchAssets = useSwitchAssets()
  const calculateBuyAmount = useCalculateBuyAmount()
  const calculateSellAmount = useCalculateSellAmount()

  const buyableAssets = tradable.filter(
    (asset) => !SELL_ONLY_ASSETS.includes(asset.id),
  )

  const handleSellAssetChange = async (sellAsset: TAsset): Promise<void> => {
    const formValues = getValues()

    if (
      formValues.type === TradeType.Sell &&
      formValues.buyAsset &&
      formValues.sellAmount
    ) {
      reset({
        ...formValues,
        buyAmount: await calculateBuyAmount(
          sellAsset,
          formValues.buyAsset,
          formValues.sellAmount,
        ),
      })
    } else if (
      formValues.type === TradeType.Buy &&
      formValues.buyAsset &&
      formValues.sellAmount
    ) {
      reset({
        ...formValues,
        sellAmount: await calculateSellAmount(
          sellAsset,
          formValues.buyAsset,
          formValues.buyAmount,
        ),
      })
    }

    trigger()
  }

  const handleBuyAssetChange = async (buyAsset: TAsset): Promise<void> => {
    const formValues = getValues()

    if (
      formValues.type === TradeType.Sell &&
      formValues.sellAsset &&
      formValues.sellAmount
    ) {
      reset({
        ...formValues,
        buyAmount: await calculateBuyAmount(
          formValues.sellAsset,
          buyAsset,
          formValues.sellAmount,
        ),
      })
    } else if (
      formValues.type === TradeType.Buy &&
      formValues.sellAsset &&
      formValues.sellAmount
    ) {
      reset({
        ...formValues,
        sellAmount: await calculateSellAmount(
          formValues.sellAsset,
          buyAsset,
          formValues.buyAmount,
        ),
      })
    }

    trigger()
  }

  const handleSellChange = useDebouncedCallback(
    async (newSellAmount: string) => {
      const formValues = getValues()
      const { sellAsset, sellAmount, buyAsset, type } = formValues

      const usedSellAmount = newSellAmount || sellAmount

      if (!sellAsset || !buyAsset) {
        return
      }

      reset({
        ...formValues,
        buyAmount: await calculateBuyAmount(
          sellAsset,
          buyAsset,
          usedSellAmount,
        ),
        isSingleTrade: true,
        ...(type === TradeType.Buy ? { type: TradeType.Sell } : {}),
      })

      trigger()
    },
    RECALCULATE_DEBOUNCE_MS,
  )

  const handleBuyChange = useDebouncedCallback(async (newBuyAmount: string) => {
    const formValues = getValues()
    const { sellAsset, buyAsset, buyAmount, type } = formValues

    const usedBuyAmount = newBuyAmount || buyAmount

    if (!sellAsset || !buyAsset) {
      return
    }

    reset({
      ...formValues,
      sellAmount: await calculateSellAmount(sellAsset, buyAsset, usedBuyAmount),
      isSingleTrade: true,
      ...(type === TradeType.Sell ? { type: TradeType.Buy } : {}),
    })

    trigger()
  }, RECALCULATE_DEBOUNCE_MS)

  return (
    <div>
      <AssetSelectFormField<MarketFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        label={t("sell")}
        assets={tradable}
        maxBalanceFallback="0"
        onAssetChange={(sellAsset, previousSellAsset) => {
          const { buyAsset } = getValues()
          const isSwitch = sellAsset.id === buyAsset?.id

          if (isSwitch) {
            setValue("sellAsset", previousSellAsset)
            switchAssets.mutate()
          } else {
            handleSellAssetChange(sellAsset)

            navigate({
              to: ".",
              search: {
                ...search,
                assetIn: sellAsset.id,
                assetOut: buyAsset?.id,
              },
              resetScroll: false,
            })
          }
        }}
        onAmountChange={(sellAmount) => {
          handleBuyChange.cancel()
          handleSellChange(sellAmount)
        }}
      />
      <MarketSwitcher />
      <AssetSelectFormField<MarketFormValues>
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        label={t("buy")}
        assets={buyableAssets}
        hideMaxBalanceAction
        maxBalanceFallback="0"
        onAssetChange={(buyAsset, previousBuyAsset) => {
          const { sellAsset } = getValues()
          const isSwitch = buyAsset.id === sellAsset?.id

          if (isSwitch) {
            setValue("buyAsset", previousBuyAsset)
            switchAssets.mutate()
          } else {
            handleBuyAssetChange(buyAsset)

            navigate({
              to: ".",
              search: { assetIn: sellAsset?.id, assetOut: buyAsset.id },
              resetScroll: false,
            })
          }
        }}
        onAmountChange={(buyAmount) => {
          handleSellChange.cancel()
          handleBuyChange(buyAmount)
        }}
      />
    </div>
  )
}
