import {
  Box,
  Flex,
  NumberInput,
  Text,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatNumber, SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { Info } from "lucide-react"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPriceQuery } from "@/api/spotPrice"
import { bestSellQuery } from "@/api/trade"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { SPriceOption } from "@/modules/trade/swap/sections/Limit/Limit.styled"
import { LimitAssetSwitcher } from "@/modules/trade/swap/sections/Limit/LimitAssetSwitcher"
import {
  EXPIRY_OPTIONS,
  ExpiryOption,
  LimitFormValues,
} from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Limit/useSwitchAssets"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  DEFAULT_TRADE_ASSET_IN_ID,
  DEFAULT_TRADE_ASSET_OUT_ID,
} from "@/routes/trade/_history/route"
import { scaleHuman } from "@/utils/formatting"

// Percentage offsets shown as pills (signed). Market pill is rendered in the middle.
// Pills left of market are negative (below market), right are positive (above market).
const PILL_PCTS_NEG = [-3, -1] as const
const PILL_PCTS_POS = [5, 10] as const

// Isolated component: watches limitPrice via useWatch so only this tiny subtree
// re-renders when the price changes — NOT the entire LimitForm tree.
const LimitPriceUsd: FC<{ buyAssetId: string }> = ({ buyAssetId }) => {
  const limitPriceVal = useWatch<LimitFormValues, "limitPrice">({
    name: "limitPrice",
  })
  const [limitPriceUsd] = useDisplayAssetPrice(buyAssetId, limitPriceVal || "0")

  if (!limitPriceUsd || !limitPriceVal || !Big(limitPriceVal).gt(0)) return null

  return (
    <Text
      fw={400}
      color={getToken("text.low")}
      style={{ fontSize: 10, lineHeight: 1.4 }}
    >
      {limitPriceUsd}
    </Text>
  )
}

export const LimitForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { tradable, getAsset } = useAssets()
  const navigate = useNavigate()
  const switchAssets = useSwitchAssets()

  const { control, getValues, setValue, reset, trigger, watch } =
    useFormContext<LimitFormValues>()

  const [sellAsset, buyAsset, sellAmount] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const buyableAssets = useMemo(
    () => tradable.filter((asset) => !SELL_ONLY_ASSETS.includes(asset.id)),
    [tradable],
  )

  const { data: spotPriceData } = useQuery(
    spotPriceQuery(rpc, sellAsset?.id ?? "", buyAsset?.id ?? ""),
  )

  // Swap execution quote: gives us the effective rate including fees & price impact
  const { data: bestSellData } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount || "0",
    }),
  )

  // Market price = router quote rate (same as swap page's Buy amount).
  // Includes pool fees, dynamic fees, and price impact — but NOT slippage.
  // Falls back to spot price when no sell amount or quote unavailable.
  //
  // IMPORTANT: We read sellAmount via getValues() (non-reactive) to avoid a
  // dependency cycle (live-sync effect writes sellAmount → watched sellAmount
  // triggers re-render → bestSellQuery refetches → marketPrice recomputes → loop).
  //
  // Stabilised via ref: marketPrice only changes identity when the computed
  // value actually differs. This prevents the live-sync effect from re-firing
  // when bestSellData gets a new object reference but the rate is unchanged.
  const marketPriceRef = useRef<string | null>(null)
  const marketPrice = useMemo(() => {
    let next: string | null = null
    const currentSellAmount = getValues("sellAmount")
    if (
      bestSellData &&
      currentSellAmount &&
      Big(currentSellAmount).gt(0) &&
      buyAsset
    ) {
      const amountOutHuman = scaleHuman(
        bestSellData.amountOut,
        buyAsset.decimals,
      )
      if (amountOutHuman && Big(amountOutHuman).gt(0)) {
        next = Big(amountOutHuman).div(currentSellAmount).toString()
      }
    }
    // Fallback: spot price (theoretical rate, no fees/impact)
    if (!next && spotPriceData?.spotPrice) {
      next = spotPriceData.spotPrice
    }
    // Only update identity when the value actually changed
    if (next !== marketPriceRef.current) {
      marketPriceRef.current = next
    }
    return marketPriceRef.current
  }, [bestSellData, buyAsset, spotPriceData?.spotPrice, getValues])

  // selectedPill: controls which pill is highlighted AND whether price auto-updates:
  //   "market" → limitPrice tracks marketPrice each block
  //   number   → limitPrice = spot × (1±pct), updates each block
  //   "custom" → user typed a price manually; no auto-update
  // Which amount field gets recalculated is determined by lastEditedFieldRef,
  // not by selectedPill.
  const [selectedPill, setSelectedPill] = useState<
    "market" | "custom" | number
  >("market")
  // Guard to prevent onValueChange from treating programmatic updates as user edits.
  // Uses a counter (not boolean) so multiple programmatic setValue calls in the same
  // render cycle are handled correctly — each increment is consumed by one onValueChange.
  const programmaticPriceRef = useRef(0)

  // Ownership model for the three linked fields (sell, buy, price):
  //   "sell"  → user typed sell only; buy is derived from sell × price
  //   "buy"   → user typed buy only; sell is derived from buy / price
  //   "both"  → user typed both amounts; price is derived from buy / sell
  // When price changes (pill, manual, live update), the non-owned field is recalculated.
  // In "both" mode, the less-recently-edited field is recalculated (via lastEditedFieldRef).
  const userOwnedFieldRef = useRef<"sell" | "buy" | "both">("sell")
  // Tracks the most-recently-edited amount field (for price-change tiebreaker in "both" mode).
  const lastEditedFieldRef = useRef<"sell" | "buy">("sell")

  // Match swap page: use Big.toString() which trims trailing zeros,
  // but cap very small numbers at 6 decimals and large ones at 2.
  const formatAmount = (raw: Big) => {
    const fixed = raw.toFixed(raw.e >= 4 ? 2 : 6)
    // Strip trailing zeros after decimal point (e.g. "10.000000" → "10")
    if (fixed.includes(".")) {
      return fixed.replace(/\.?0+$/, "")
    }
    return fixed
  }

  const recalculateBuyAmount = (
    currentSellAmount: string,
    internalLimitPrice: string,
  ) => {
    if (
      !currentSellAmount ||
      !internalLimitPrice ||
      Big(internalLimitPrice).eq(0)
    ) {
      setValue("buyAmount", "")
      return
    }
    const raw = Big(currentSellAmount).times(internalLimitPrice)
    const next = formatAmount(raw)
    // Skip no-op writes to avoid triggering unnecessary re-renders / query refetches
    if (next === getValues("buyAmount")) return
    setValue("buyAmount", next)
  }

  const recalculateSellAmount = (
    currentBuyAmount: string,
    internalLimitPrice: string,
  ) => {
    if (
      !currentBuyAmount ||
      !internalLimitPrice ||
      Big(internalLimitPrice).eq(0)
    ) {
      setValue("sellAmount", "")
      return
    }
    const raw = Big(currentBuyAmount).div(internalLimitPrice)
    const next = formatAmount(raw)
    // Skip no-op writes — sellAmount is watched and drives bestSellQuery,
    // so redundant setValue would trigger a refetch → new marketPrice → loop.
    if (next === getValues("sellAmount")) return
    setValue("sellAmount", next)
  }

  // Prefill limit price on initial load or asset change
  const prevAssetsRef = useRef<string>("")
  useEffect(() => {
    const assetsKey = `${sellAsset?.id}-${buyAsset?.id}`
    const assetsChanged = prevAssetsRef.current !== assetsKey
    prevAssetsRef.current = assetsKey

    if (!marketPrice) return

    const currentLimitPrice = getValues("limitPrice")
    if (!currentLimitPrice || assetsChanged) {
      lastSyncedPriceRef.current = marketPrice
      programmaticPriceRef.current += 1
      setValue("limitPrice", marketPrice)
      setSelectedPill("market")
      // Only recalculate buy if user hasn't explicitly typed a buy amount
      if (userOwnedFieldRef.current !== "buy") {
        const currentSellAmount = getValues("sellAmount")
        if (currentSellAmount) {
          recalculateBuyAmount(currentSellAmount, marketPrice)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketPrice, sellAsset?.id, buyAsset?.id, getValues, setValue])

  // Keep limit price synced to live anchor while a pill (Market or numeric ±%) is selected.
  // Both spot and market are invalidated every block via @block prefix, so this fires
  // each new block. Market pill tracks marketPrice; numeric pills track spot ± offset.
  // In "custom" (price-locked) mode, refreshes don't touch limitPrice.
  // Recalculates whichever amount field the user did NOT last edit.
  //
  // lastSyncedPriceRef prevents re-running when the computed pill price hasn't
  // actually changed (e.g. bestSellData got a new object ref but same rate).
  const spotPriceValue = spotPriceData?.spotPrice ?? null
  const lastSyncedPriceRef = useRef<string | null>(null)
  useEffect(() => {
    // "custom" = user typed price or both amounts derive price → don't auto-update.
    if (selectedPill === "custom") return
    const next = computePillPrice(selectedPill)
    if (!next) return

    // Skip if the computed price is identical to what we last synced —
    // avoids cascading setValue → re-render → refetch → effect loops.
    if (next === lastSyncedPriceRef.current) return
    lastSyncedPriceRef.current = next

    programmaticPriceRef.current += 1
    setValue("limitPrice", next)
    trigger("limitPrice")

    // Recalculate the derived field based on ownership.
    // NEVER write sellAmount here — it drives bestSellQuery and would cause
    // an infinite loop (sellAmount change → refetch → new marketPrice → effect).
    // When user owns buy, we can't recalculate sell, so skip amount updates
    // entirely — only the price display updates.
    if (userOwnedFieldRef.current !== "buy") {
      const currentSellAmount = getValues("sellAmount")
      if (currentSellAmount) recalculateBuyAmount(currentSellAmount, next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketPrice, spotPriceValue, selectedPill, setValue, trigger, getValues])

  // Ensure default assets on mount
  useEffect(() => {
    const { sellAsset: sa, buyAsset: ba, ...values } = getValues()

    if (!sa || !ba) {
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
    newSellAsset: TAsset,
    previousSellAsset: TAsset | null,
  ): void => {
    const { buyAsset: ba } = getValues()

    if (newSellAsset.id !== ba?.id) {
      trigger("sellAmount")
      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: newSellAsset.id,
          assetOut: ba?.id,
        }),
        resetScroll: false,
      })
    } else {
      setValue("sellAsset", previousSellAsset)
      switchAssets.mutate()
    }
  }

  const handleBuyAssetChange = (
    newBuyAsset: TAsset,
    previousBuyAsset: TAsset | null,
  ): void => {
    const { sellAsset: sa } = getValues()

    if (newBuyAsset.id !== sa?.id) {
      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: sa?.id,
          assetOut: newBuyAsset.id,
        }),
        resetScroll: false,
      })
    } else {
      setValue("buyAsset", previousBuyAsset)
      switchAssets.mutate()
    }
  }

  const resetLimitToMarket = () => {
    if (marketPrice) {
      lastSyncedPriceRef.current = marketPrice
      programmaticPriceRef.current += 1
      setValue("limitPrice", marketPrice)
    }
    setSelectedPill("market")
    userOwnedFieldRef.current = lastEditedFieldRef.current
  }

  const handleSellAmountChange = (newSellAmount: string) => {
    lastEditedFieldRef.current = "sell"

    if (!newSellAmount || Big(newSellAmount).eq(0)) {
      // Don't reset userOwnedFieldRef here — this may be a transient empty
      // state during typing (e.g. triple-click + type briefly fires "").
      setValue("buyAmount", "")
      resetLimitToMarket()
      return
    }

    const currentBuy = getValues("buyAmount")
    const owned = userOwnedFieldRef.current

    // User is typing buy-side (or was) and now edits sell too → both specified → derive price.
    if (
      (owned === "buy" || owned === "both") &&
      currentBuy &&
      Big(currentBuy).gt(0)
    ) {
      userOwnedFieldRef.current = "both"
      const derivedPrice = Big(currentBuy).div(Big(newSellAmount))
      programmaticPriceRef.current += 1
      setValue("limitPrice", derivedPrice.toString())
      trigger("limitPrice")
      setSelectedPill("custom")
      return
    }

    // Only sell specified → price is anchor, derive buy.
    userOwnedFieldRef.current = "sell"
    recalculateBuyAmount(newSellAmount, getValues("limitPrice"))
  }

  const handleBuyAmountChange = (newBuyAmount: string) => {
    lastEditedFieldRef.current = "buy"

    if (!newBuyAmount || Big(newBuyAmount).eq(0)) {
      // Don't reset userOwnedFieldRef here — this may be a transient empty
      // state during typing (e.g. triple-click + type briefly fires "").
      setValue("buyAmount", newBuyAmount || "")
      const currentSell = getValues("sellAmount")
      if (!currentSell) resetLimitToMarket()
      return
    }

    const currentSell = getValues("sellAmount")
    const owned = userOwnedFieldRef.current

    // User typed sell first and now edits buy too → both specified → derive price.
    if (
      (owned === "sell" || owned === "both") &&
      currentSell &&
      Big(currentSell).gt(0)
    ) {
      userOwnedFieldRef.current = "both"
      const derivedPrice = Big(newBuyAmount).div(currentSell)
      programmaticPriceRef.current += 1
      setValue("limitPrice", derivedPrice.toString())
      trigger("limitPrice")
      setSelectedPill("custom")
      return
    }

    // Only buy specified → price is anchor, derive sell.
    userOwnedFieldRef.current = "buy"
    recalculateSellAmount(newBuyAmount, getValues("limitPrice"))
  }

  const handleLimitPriceChange = (internalLimitPrice: string) => {
    // Don't recalculate amounts while user is still typing a price
    // (e.g. editing "0.00197" → "0.00" mid-edit).
    if (!internalLimitPrice || Big(internalLimitPrice).eq(0)) return

    // User explicitly set a price → exit "both" mode, keep the most-recently-edited
    // field and recalculate the other.
    if (userOwnedFieldRef.current === "both") {
      userOwnedFieldRef.current = lastEditedFieldRef.current
    }

    if (userOwnedFieldRef.current === "buy") {
      recalculateSellAmount(getValues("buyAmount"), internalLimitPrice)
    } else {
      recalculateBuyAmount(getValues("sellAmount"), internalLimitPrice)
    }
  }

  // Compute the limit price for a pill.
  //   "market" → live executable rate (marketPrice; includes fees + impact for typed size).
  //   ±pct    → offset from spot (stable theoretical rate, size/fee independent).
  // Price is always buyAsset per sellAsset (no inversion).
  const computePillPrice = (pill: "market" | number): string | null => {
    if (pill === "market") return marketPrice
    const spot = spotPriceData?.spotPrice
    if (!spot) return null
    const factor = 1 + pill / 100
    if (factor <= 0) return null
    return Big(spot).times(factor).toString()
  }

  const handlePriceAdjustment = (pill: "market" | number) => {
    const adjustedPrice = computePillPrice(pill)
    if (!adjustedPrice) return
    setSelectedPill(pill)
    // Record the price so the live-sync effect doesn't immediately re-fire
    lastSyncedPriceRef.current = adjustedPrice
    programmaticPriceRef.current += 1
    setValue("limitPrice", adjustedPrice)
    trigger("limitPrice")
    handleLimitPriceChange(adjustedPrice)
  }

  return (
    <Box>
      <AssetSelectFormField<LimitFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        assets={tradable}
        label={t("sell")}
        maxBalanceFallback="0"
        onAssetChange={handleSellAssetChange}
        onAmountChange={handleSellAmountChange}
      />
      <LimitAssetSwitcher />
      <AssetSelectFormField<LimitFormValues>
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        assets={buyableAssets}
        label={t("get")}
        hideMaxBalanceAction
        maxBalanceFallback="0"
        onAssetChange={handleBuyAssetChange}
        onAmountChange={handleBuyAmountChange}
      />

      <SwapSectionSeparator />

      <Box pt="l" pb="m">
        <Flex align="center" justify="space-between" mb="s">
          <Text
            fw={500}
            fs="p5"
            color={getToken("text.medium")}
            style={{ whiteSpace: "nowrap" }}
          >
            {t("trade:limit.limitPrice.label")}
          </Text>
          <Flex gap="s" style={{ flexShrink: 0 }}>
            {PILL_PCTS_NEG.map((pct) => (
              <SPriceOption
                key={pct}
                active={selectedPill === pct}
                onClick={() => handlePriceAdjustment(pct)}
              >
                {pct}%
              </SPriceOption>
            ))}
            <SPriceOption
              active={selectedPill === "market"}
              onClick={() => handlePriceAdjustment("market")}
            >
              {t("trade:limit.market")}
            </SPriceOption>
            {PILL_PCTS_POS.map((pct) => (
              <SPriceOption
                key={pct}
                active={selectedPill === pct}
                onClick={() => handlePriceAdjustment(pct)}
              >
                +{pct}%
              </SPriceOption>
            ))}
          </Flex>
        </Flex>

        <Flex align="center" justify="space-between">
          <Text
            fw={600}
            fs="p3"
            color={getToken("text.high")}
            style={{ whiteSpace: "nowrap" }}
          >
            {`1 ${sellAsset?.symbol ?? ""} =`}
          </Text>
          <Flex direction="column" style={{ alignItems: "flex-end" }}>
            <Controller
              control={control}
              name="limitPrice"
              render={({ field }) => (
                <NumberInput
                  value={
                    field.value && !Big(field.value).eq(0)
                      ? formatNumber(field.value, undefined, {
                          useGrouping: false,
                        })
                      : ""
                  }
                  onValueChange={({ value }) => {
                    if (programmaticPriceRef.current > 0) {
                      programmaticPriceRef.current -= 1
                      return
                    }
                    // Treat empty / zero as intermediate editing state — don't
                    // clear amount fields while user is still typing.
                    const parsed = value ? value : "0"
                    field.onChange(parsed)
                    setSelectedPill("custom")
                    handleLimitPriceChange(parsed)
                  }}
                  trailingElement={
                    <Text
                      fw={600}
                      fs="p3"
                      color={getToken("text.low")}
                      style={{ marginLeft: 4 }}
                    >
                      {buyAsset?.symbol}
                    </Text>
                  }
                  allowNegative={false}
                  sx={{
                    textAlign: "right",
                    background: "transparent !important",
                    border: "none !important",
                    boxShadow: "none !important",
                    padding: 0,
                    fontSize: "inherit",
                    fontWeight: 600,
                    "&:hover, &:focus, &:focus-within": {
                      background: "transparent !important",
                      border: "none !important",
                      boxShadow: "none !important",
                    },
                  }}
                />
              )}
            />
            <LimitPriceUsd buyAssetId={buyAsset?.id ?? ""} />
          </Flex>
        </Flex>
      </Box>

      <Flex align="center" justify="space-between" pb="m">
        <Text fw={500} fs="p5" color={getToken("text.medium")}>
          {t("trade:limit.expiry.label")}
        </Text>
        <Flex gap="s">
          <Controller
            control={control}
            name="expiry"
            render={({ field }) => (
              <>
                {EXPIRY_OPTIONS.map((option) => (
                  <SPriceOption
                    key={option}
                    active={field.value === option}
                    onClick={() => field.onChange(option as ExpiryOption)}
                  >
                    {t(`trade:limit.expiry.${option}`)}
                  </SPriceOption>
                ))}
              </>
            )}
          />
        </Flex>
      </Flex>

      <Flex align="center" justify="space-between" pb="m">
        <Text fw={500} fs="p5" color={getToken("text.medium")}>
          {t("trade:limit.partiallyFillable.label")}
        </Text>
        <Flex align="center" gap="s">
          <Tooltip text={t("trade:limit.partiallyFillable.tooltip")}>
            <Flex align="center" sx={{ color: getToken("text.low") }}>
              <Info size={14} />
            </Flex>
          </Tooltip>
          <Controller
            control={control}
            name="partiallyFillable"
            render={({ field }) => (
              <>
                <Text fw={500} fs="p5" color={getToken("text.tint.secondary")}>
                  {field.value
                    ? t("trade:limit.partiallyFillable.enabled")
                    : t("trade:limit.partiallyFillable.disabled")}
                </Text>
                <Toggle
                  size="medium"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </>
            )}
          />
        </Flex>
      </Flex>
    </Box>
  )
}
