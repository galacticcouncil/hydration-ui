import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { bestSellQuery } from "@/api/trade"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useOwnedAssets } from "@/hooks/data/useOwnedAssets"
import { AssetSwitcher } from "@/modules/trade/swap/components/AssetSwitcher/AssetSwitcher"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/useMarketForm"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

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
        onAmountChange={async (sellAmount) => {
          const { sellAsset, buyAsset } = getValues()

          if (!buyAsset || !sellAsset) {
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
        }}
      />
      <AssetSwitcher onSwitchAssets={switchAssets} />
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
        onAmountChange={async (buyAmount) => {
          const { buyAsset, sellAsset } = getValues()

          if (!buyAsset || !sellAsset) {
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
        }}
      />
    </div>
  )
}
