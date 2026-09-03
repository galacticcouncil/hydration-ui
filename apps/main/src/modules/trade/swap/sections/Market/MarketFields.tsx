import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useNavigate } from "@tanstack/react-router"
import { FC, useEffect, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Trade, TradeOrder, TradeType } from "@/api/trade"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"
import { MarketSwitcher } from "@/modules/trade/swap/sections/Market/MarketSwitcher"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly maxSellBalance: string
  readonly maxSellBalanceLoading: boolean
}

export const MarketFields: FC<Props> = ({
  swap,
  twap,
  maxSellBalance,
  maxSellBalanceLoading,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const { tradable } = useAssets()
  const { featureFlags } = useRpcProvider()

  const navigate = useNavigate()

  const { getValues, setValue, trigger, watch } =
    useFormContext<MarketFormValues>()

  const switchAssets = useSwitchAssets()

  const buyableAssets = useMemo(
    () => tradable.filter((asset) => !SELL_ONLY_ASSETS.includes(asset.id)),
    [tradable],
  )
  const [type, sellAsset, buyAsset, sellAmount, buyAmount, isSingleTrade] =
    watch([
      "type",
      "sellAsset",
      "buyAsset",
      "sellAmount",
      "buyAmount",
      "isSingleTrade",
    ])

  const isSell = type === TradeType.Sell
  const isEmpty = isSell ? !sellAmount : !buyAmount

  // Display the raw router quote — the expected amount, net of trade fees and
  // price impact but NOT the user's slippage (same as the classic swap page).
  // Slippage shows separately as "Minimum received" in the summary, and the
  // ICE extrinsic still commits the floor via `.withSlippage()`.
  const amountOut = isEmpty
    ? undefined
    : isSingleTrade
      ? swap?.amountOut
      : twap?.amountOut
  const amountIn = isEmpty
    ? undefined
    : isSingleTrade
      ? swap?.amountIn
      : twap?.amountIn

  useEffect(() => {
    if (!isSell || !buyAsset) {
      return
    }

    const nextBuyAmount = amountOut
      ? scaleHuman(amountOut, buyAsset.decimals)
      : ""

    if (buyAmount !== nextBuyAmount) {
      setValue("buyAmount", nextBuyAmount)
      trigger()
    }
  }, [buyAmount, buyAsset, setValue, trigger, amountOut, isSell])

  useEffect(() => {
    if (isSell || !sellAsset) {
      return
    }

    const nextSellAmount = amountIn
      ? scaleHuman(amountIn, sellAsset.decimals)
      : ""

    if (sellAmount !== nextSellAmount) {
      setValue("sellAmount", nextSellAmount)
      trigger()
    }
  }, [sellAmount, sellAsset, setValue, trigger, amountIn, isSell])

  return (
    <div>
      <AssetSelectFormField<MarketFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        label={t("sell")}
        assets={tradable}
        maxBalanceFallback="0"
        maxBalance={maxSellBalance}
        maxBalanceLoading={maxSellBalanceLoading}
        onAssetChange={(sellAsset, previousSellAsset) => {
          const { buyAsset } = getValues()
          const isSwitch = sellAsset.id === buyAsset?.id

          if (isSwitch) {
            setValue("sellAsset", previousSellAsset)
            switchAssets()
          } else {
            navigate({
              to: ".",
              search: (search) => ({
                ...search,
                assetIn: sellAsset.id,
                assetOut: buyAsset?.id,
              }),
              resetScroll: false,
            })
          }
        }}
        onAmountChange={() => {
          if (!isSell) {
            setValue("type", TradeType.Sell)
          }
        }}
      />
      <MarketSwitcher swap={swap} />
      <AssetSelectFormField<MarketFormValues>
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        label={
          // Intent TWAP settles at market with no fixed output floor, so the
          // received amount is an estimate in both entry directions — flag it
          // on the receive field header.
          featureFlags.isIceEnabled && !isSingleTrade
            ? t("trade:market.form.buy.estimated")
            : t("buy")
        }
        assets={buyableAssets}
        hideMaxBalanceAction
        maxBalanceFallback="0"
        onAssetChange={(buyAsset, previousBuyAsset) => {
          const { sellAsset } = getValues()
          const isSwitch = buyAsset.id === sellAsset?.id

          if (isSwitch) {
            setValue("buyAsset", previousBuyAsset)
            switchAssets()
          } else {
            navigate({
              to: ".",
              search: (search) => ({
                ...search,
                assetIn: sellAsset?.id,
                assetOut: buyAsset.id,
              }),
              resetScroll: false,
            })
          }
        }}
        onAmountChange={() => {
          if (isSell) {
            setValue("type", TradeType.Buy)
          }
        }}
      />
    </div>
  )
}
