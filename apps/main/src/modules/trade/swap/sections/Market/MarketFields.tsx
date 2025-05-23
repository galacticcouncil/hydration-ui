import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebouncedCallback } from "use-debounce"

import { bestSellQuery } from "@/api/trade"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useOwnedAssets } from "@/hooks/data/useOwnedAssets"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

const RECALCULATE_DEBOUNCE_MS = 120

export const MarketFields: FC = () => {
  const rpc = useRpcProvider()
  const { t } = useTranslation(["common", "trade"])
  const { tradable } = useAssets()
  const ownedAssets = useOwnedAssets()

  const navigate = useNavigate()
  const { setValue, trigger, getValues } = useFormContext<MarketFormValues>()

  const switchAssets = (): void => {
    const { buyAmount, sellAmount, sellAsset, buyAsset } = getValues()

    setValue("buyAmount", sellAmount)
    setValue("sellAmount", buyAmount)
    setValue("sellAsset", buyAsset)
    setValue("buyAsset", sellAsset)

    trigger(["buyAmount", "sellAmount", "sellAsset", "buyAsset"])
  }

  const queryClient = useQueryClient()

  const resetType = () => setValue("type", "swap")

  const changeSellAmount = useDebouncedCallback(
    async (sellAmount: string): Promise<void> => {
      const { sellAsset, buyAsset } = getValues()

      if (!buyAsset || !sellAsset || Big(sellAmount || "0").lte(0)) {
        return
      }

      resetType()
      const { amountOut } = await queryClient.ensureQueryData(
        bestSellQuery(rpc, {
          assetIn: sellAsset.id,
          assetOut: buyAsset.id,
          amountIn: sellAmount,
        }),
      )

      setValue("buyAmount", scaleHuman(amountOut, buyAsset.decimals), {
        shouldValidate: true,
      })
    },
    RECALCULATE_DEBOUNCE_MS,
  )

  const changeBuyAmount = useDebouncedCallback(
    async (buyAmount: string): Promise<void> => {
      const { buyAsset, sellAsset } = getValues()

      if (!buyAsset || !sellAsset || Big(buyAmount || "0").lte(0)) {
        return
      }

      resetType()
      const { amountOut } = await queryClient.ensureQueryData(
        bestSellQuery(rpc, {
          assetIn: buyAsset.id,
          assetOut: sellAsset.id,
          amountIn: buyAmount,
        }),
      )

      setValue("sellAmount", scaleHuman(amountOut, sellAsset.decimals), {
        shouldValidate: true,
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
        onAssetChange={(sellAsset) => {
          resetType()
          const { buyAsset } = getValues()

          navigate({
            from: "/trade/swap/market",
            to: "/trade/swap/market",
            search: { assetOut: buyAsset?.id, assetIn: sellAsset.id },
          })
        }}
        onAmountChange={changeSellAmount}
      />
      <AssetSwitcher
        onSwitchAssets={switchAssets}
        onPriceClick={() => null}
        price="1 HDX = 3 661.923 kUSD"
      />
      <AssetSelectFormField<MarketFormValues>
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        label={t("buy")}
        assets={tradable}
        ignoreBalance
        onAssetChange={(buyAsset) => {
          resetType()
          const { sellAsset } = getValues()

          navigate({
            from: "/trade/swap/market",
            to: "/trade/swap/market",
            search: { assetOut: buyAsset.id, assetIn: sellAsset?.id },
          })
        }}
        onAmountChange={changeBuyAmount}
      />
    </div>
  )
}
