import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebouncedCallback } from "use-debounce"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useOwnedAssets } from "@/hooks/data/useOwnedAssets"
import { useCalculateBuyAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateBuyAmount"
import { useCalculateSellAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateSellAmount"
import {
  MarketFormValues,
  TradeType,
} from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"
import { MarketSwitcher } from "@/modules/trade/swap/sections/Market/MarketSwitcher"
import { useAssets } from "@/providers/assetsProvider"
import { SELL_ONLY_ASSETS } from "@/utils/consts"

const RECALCULATE_DEBOUNCE_MS = 250

export const MarketFields: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { tradable } = useAssets()
  const ownedAssets = useOwnedAssets()

  const navigate = useNavigate()
  const search = useSearch({ from: "/trade/_history" })

  const { reset, getValues, setValue } = useFormContext<MarketFormValues>()

  const switchAssets = useSwitchAssets()
  const calculateBuyAmount = useCalculateBuyAmount()
  const calculateSellAmount = useCalculateSellAmount()

  const buyableAssets = tradable.filter(
    (asset) => !SELL_ONLY_ASSETS.includes(asset.id),
  )

  const handleSellAmountChange = useDebouncedCallback(
    async (sellAmount: string): Promise<void> => {
      const formValues = getValues()
      const { sellAsset, buyAsset, type } = formValues

      if (!sellAsset || !buyAsset || !sellAmount) {
        return
      }

      reset({
        ...formValues,
        buyAmount: await calculateBuyAmount(sellAsset, buyAsset, sellAmount),
        isSingleTrade: true,
        ...(type === TradeType.Buy ? { type: TradeType.Sell } : {}),
      })
    },
    RECALCULATE_DEBOUNCE_MS,
  )

  const handleBuyAmountChange = useDebouncedCallback(
    async (buyAmount: string): Promise<void> => {
      const formValues = getValues()
      const { sellAsset, buyAsset, type } = formValues

      if (!sellAsset || !buyAsset || !buyAmount) {
        return
      }

      reset({
        ...formValues,
        sellAmount: await calculateSellAmount(sellAsset, buyAsset, buyAmount),
        isSingleTrade: true,
        ...(type === TradeType.Sell ? { type: TradeType.Buy } : {}),
      })
    },
    RECALCULATE_DEBOUNCE_MS,
  )

  return (
    <div>
      <AssetSelectFormField<MarketFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        label={t("sell")}
        assets={ownedAssets}
        onAssetChange={(sellAsset, previousSellAsset) => {
          const { buyAsset } = getValues()
          const isSwitch = sellAsset.id === buyAsset?.id

          if (isSwitch) {
            setValue("sellAsset", previousSellAsset)
            switchAssets.mutate()
          } else {
            setValue("isSingleTrade", true)

            navigate({
              to: ".",
              search: {
                ...search,
                assetIn: sellAsset.id,
                assetOut: buyAsset?.id,
              },
            })
          }
        }}
        onAmountChange={(sellAmount) => {
          handleBuyAmountChange.cancel()
          handleSellAmountChange(sellAmount)
        }}
      />
      <MarketSwitcher />
      <AssetSelectFormField<MarketFormValues>
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        label={t("buy")}
        assets={buyableAssets}
        ignoreBalance
        onAssetChange={(buyAsset, previousBuyAsset) => {
          const { sellAsset } = getValues()
          const isSwitch = buyAsset.id === sellAsset?.id

          if (isSwitch) {
            setValue("buyAsset", previousBuyAsset)
            switchAssets.mutate()
          } else {
            setValue("isSingleTrade", true)

            navigate({
              to: ".",
              search: { assetIn: sellAsset?.id, assetOut: buyAsset.id },
            })
          }
        }}
        onAmountChange={(buyAmount) => {
          handleSellAmountChange.cancel()
          handleBuyAmountChange(buyAmount)
        }}
      />
    </div>
  )
}
