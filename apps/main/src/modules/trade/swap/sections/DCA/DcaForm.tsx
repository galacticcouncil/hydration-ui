import { Box } from "@galacticcouncil/ui/components"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useEffect, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { bestSellQuery } from "@/api/trade"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { DcaAssetSwitcher } from "@/modules/trade/swap/sections/DCA/DcaAssetSwitcher"
import { DcaLimitedBudgetFields } from "@/modules/trade/swap/sections/DCA/DcaLimitedBudgetFields"
import { DcaLimitPrice } from "@/modules/trade/swap/sections/DCA/DcaLimitPrice"
import { DcaOpenBudgetFields } from "@/modules/trade/swap/sections/DCA/DcaOpenBudgetFields"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  DEFAULT_TRADE_ASSET_IN_ID,
  DEFAULT_TRADE_ASSET_OUT_ID,
} from "@/routes/trade/_history/route"

export const DcaForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { control, getValues, setValue, reset, trigger, watch } =
    useFormContext<DcaFormValues>()

  const isOpenBudget = watch("orders.type") === DcaOrdersMode.OpenBudget
  const [sellAsset, buyAsset, sellAmount] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const { tradable, getAsset } = useAssets()
  const switchAssets = useSwitchAssets()
  const rpc = useRpcProvider()

  const navigate = useNavigate()

  // Market reference for the limit-price section. Same router quote the
  // Limit tab uses; a 1-unit probe when no amount is entered gives a stable
  // fee-adjusted spot. Expressed as SELL-per-BUY (inHuman / outHuman) to
  // match the "When 1 {BUY} price is below {P} {SELL}" label.
  const sellAmountForQuote =
    sellAmount && Big(sellAmount).gt(0) ? sellAmount : "1"
  const { data: marketSwap } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmountForQuote,
    }),
  )
  const marketSellPerBuy = (() => {
    if (!marketSwap || !sellAsset || !buyAsset) return null
    try {
      const inHuman = Big(marketSwap.amountIn.toString()).div(
        Big(10).pow(sellAsset.decimals),
      )
      const outHuman = Big(marketSwap.amountOut.toString()).div(
        Big(10).pow(buyAsset.decimals),
      )
      if (inHuman.lte(0) || outHuman.lte(0)) return null
      return inHuman.div(outHuman).toString()
    } catch {
      return null
    }
  })()

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
      <DcaLimitPrice marketSellPerBuy={marketSellPerBuy} />
    </Box>
  )
}
