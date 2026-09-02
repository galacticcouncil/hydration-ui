import { Stack } from "@galacticcouncil/ui/components"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { bestSellQuery } from "@/api/trade"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { QuotedPriceField } from "@/modules/trade/swap/components/QuotedPriceField/QuotedPriceField"
import {
  marketPriceFromQuote,
  PriceSource,
} from "@/modules/trade/swap/lib/quotedPrice"
import { useQuotedPrice } from "@/modules/trade/swap/lib/quotedPrice.hook"
import {
  computeDerived,
  FieldName,
  getDerived,
  lockSellIntoLastTwo,
  updateLastTwoOnTouch,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"
import { LimitOrderSettings } from "@/modules/trade/swap/sections/Limit/LimitOrderSettings"
import { LimitSwitcher } from "@/modules/trade/swap/sections/Limit/LimitSwitcher"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const RECALCULATE_DEBOUNCE_MS = 250

export const LimitFields: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { tradable } = useAssets()
  const rpc = useRpcProvider()
  const navigate = useNavigate()

  const { reset, getValues, setValue, trigger, watch } =
    useFormContext<LimitFormValues>()

  const [sellAsset, buyAsset, sellAmount, isLocked] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "isLocked",
  ])

  const buyableAssets = tradable.filter(
    (asset) => !SELL_ONLY_ASSETS.includes(asset.id),
  )

  const sellAmountForQuote =
    sellAmount && Big(sellAmount || "0").gt(0) ? sellAmount : "1"

  const { data: swap } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmountForQuote,
    }),
  )

  const marketPrice = marketPriceFromQuote(
    swap,
    sellAsset?.decimals,
    buyAsset?.decimals,
  )

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounced = useCallback((fn: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fn, RECALCULATE_DEBOUNCE_MS)
  }, [])

  const applyPriceTouch = useCallback(
    (newLimitPrice: string) => {
      const values = getValues()
      const lastTwo = updateLastTwoOnTouch(
        values.lastTwo,
        "price",
        values.isLocked,
      )
      if (lastTwo !== values.lastTwo) setValue("lastTwo", lastTwo)
      setValue("limitPrice", newLimitPrice)

      const derived = getDerived(lastTwo)
      if (derived !== "price") {
        const computed = computeDerived(derived, {
          sell: values.sellAmount ?? "",
          buy: values.buyAmount ?? "",
          price: newLimitPrice,
        })
        if (derived === "buy") setValue("buyAmount", computed ?? "")
        else setValue("sellAmount", computed ?? "")
      }
      trigger()
    },
    [getValues, setValue, trigger],
  )

  const applyMarketPrice = useCallback(
    (newLimitPrice: string) => {
      const values = getValues()
      if (values.limitPrice === newLimitPrice) return

      const lastTwo = values.lastTwo.includes("price")
        ? values.lastTwo
        : updateLastTwoOnTouch(values.lastTwo, "price", values.isLocked)
      if (lastTwo !== values.lastTwo) setValue("lastTwo", lastTwo)

      setValue("limitPrice", newLimitPrice)

      const derived = getDerived(lastTwo)
      if (derived === "price") return

      const computed = computeDerived(derived, {
        sell: values.sellAmount ?? "",
        buy: values.buyAmount ?? "",
        price: newLimitPrice,
      })
      if (computed === null) return
      if (derived === "buy") setValue("buyAmount", computed)
      else setValue("sellAmount", computed)
    },
    [getValues, setValue],
  )

  const quotedPrice = useQuotedPrice({
    marketPrice,
    pair: [sellAsset?.id ?? "", buyAsset?.id ?? ""],
    defaultInverted: false,
    onCanonicalChange: (canonical: string, source: PriceSource) => {
      if (source === "derived") return
      if (source === "user") applyPriceTouch(canonical)
      else applyMarketPrice(canonical)
    },
  })

  const { dispatch } = quotedPrice

  const recomputeDerivedField = useCallback(() => {
    const values = getValues()
    const derived = getDerived(values.lastTwo)
    const computed = computeDerived(derived, {
      sell: values.sellAmount ?? "",
      buy: values.buyAmount ?? "",
      price: values.limitPrice ?? "",
    })
    if (derived === "buy") {
      setValue("buyAmount", computed ?? "")
    } else if (derived === "sell") {
      setValue("sellAmount", computed ?? "")
    } else {
      setValue("limitPrice", computed ?? "")
      dispatch({ type: "derived", value: computed })
    }
  }, [getValues, setValue, dispatch])

  const onFieldTouch = useCallback(
    (field: FieldName) => {
      const values = getValues()
      const next = updateLastTwoOnTouch(values.lastTwo, field, values.isLocked)
      if (next !== values.lastTwo) setValue("lastTwo", next)
      if (getDerived(next) === "price") {
        dispatch({ type: "derived", value: values.limitPrice ?? "" })
      }
      debounced(() => {
        recomputeDerivedField()
        trigger()
      })
    },
    [debounced, dispatch, getValues, recomputeDerivedField, setValue, trigger],
  )

  const handleSellAmountChange = useCallback(
    (_newSellAmount: string) => onFieldTouch("sell"),
    [onFieldTouch],
  )
  const handleBuyAmountChange = useCallback(
    (_newBuyAmount: string) => onFieldTouch("buy"),
    [onFieldTouch],
  )

  const handleLockToggle = useCallback(() => {
    const values = getValues()
    const nextLocked = !values.isLocked
    setValue("isLocked", nextLocked)
    if (nextLocked) {
      const next = lockSellIntoLastTwo(values.lastTwo)
      if (next !== values.lastTwo) setValue("lastTwo", next)
      debounced(() => {
        recomputeDerivedField()
        trigger()
      })
    }
  }, [getValues, setValue, debounced, recomputeDerivedField, trigger])

  const handleAssetChange = useCallback(
    (next: Partial<LimitFormValues>) => {
      reset({
        ...getValues(),
        ...next,
        buyAmount: "",
        lastTwo: ["price", "sell"],
      })
      trigger()
    },
    [getValues, reset, trigger],
  )

  return (
    <Stack>
      <AssetSelectFormField<LimitFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        label={t("sell")}
        assets={tradable}
        maxBalanceFallback="0"
        onLockToggle={sellAmount ? handleLockToggle : undefined}
        isLocked={isLocked}
        onAssetChange={(sellAsset, previousSellAsset) => {
          const { buyAsset } = getValues()
          if (sellAsset.id === buyAsset?.id) {
            setValue("sellAsset", previousSellAsset)
            return
          }
          handleAssetChange({ sellAsset })
          navigate({
            to: ".",
            search: (search) => ({
              ...search,
              assetIn: sellAsset.id,
              assetOut: buyAsset?.id,
            }),
            resetScroll: false,
          })
        }}
        onAmountChange={handleSellAmountChange}
      />

      <LimitSwitcher />

      <AssetSelectFormField<LimitFormValues>
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        label={t("trade:limit.receiveAtLeast")}
        assets={buyableAssets}
        hideMaxBalanceAction
        maxBalanceFallback="0"
        onAssetChange={(buyAsset, previousBuyAsset) => {
          const { sellAsset } = getValues()
          if (buyAsset.id === sellAsset?.id) {
            setValue("buyAsset", previousBuyAsset)
            return
          }
          handleAssetChange({ buyAsset })
          navigate({
            to: ".",
            search: (search) => ({
              ...search,
              assetIn: sellAsset?.id,
              assetOut: buyAsset.id,
            }),
            resetScroll: false,
          })
        }}
        onAmountChange={handleBuyAmountChange}
      />

      <SwapSectionSeparator />

      <QuotedPriceField
        binding={quotedPrice}
        baseAssetId={quotedPrice.view.inverted ? buyAsset?.id : sellAsset?.id}
        baseSymbol={
          (quotedPrice.view.inverted ? buyAsset?.symbol : sellAsset?.symbol) ??
          ""
        }
        quoteSymbol={
          (quotedPrice.view.inverted ? sellAsset?.symbol : buyAsset?.symbol) ??
          ""
        }
        marketLabel={t("trade:limit.market")}
      />

      <LimitOrderSettings />
    </Stack>
  )
}
