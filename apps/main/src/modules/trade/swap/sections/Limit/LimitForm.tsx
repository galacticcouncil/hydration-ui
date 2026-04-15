import {
  Box,
  Flex,
  NumberInput,
  Separator,
  Text,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatNumber, SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { ArrowDown, ArrowUp, Info, Pencil } from "lucide-react"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPriceQuery } from "@/api/spotPrice"
import { bestSellQuery } from "@/api/trade"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  SCustomPctInput,
  SPctBadge,
  SPriceOption,
} from "@/modules/trade/swap/sections/Limit/Limit.styled"
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

// Custom pill allowed range. Negative < -99% would yield a non-positive price.
// Upper cap is a sanity limit to prevent runaway values.
const CUSTOM_PCT_MIN = -99
const CUSTOM_PCT_MAX = 500

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

// Matcha-style badge: shows signed % deviation of the current limit price
// from the market spot price. Rendered only when the user has set a custom
// price (via price input or derived from typing the buy amount).
const PriceDeviationBadge: FC<{
  spotPrice: string | null
  active: boolean
}> = ({ spotPrice, active }) => {
  const limitPriceVal = useWatch<LimitFormValues, "limitPrice">({
    name: "limitPrice",
  })

  if (!active || !spotPrice || !limitPriceVal) return null
  try {
    if (Big(spotPrice).lte(0) || Big(limitPriceVal).lte(0)) return null
    const pct = Big(limitPriceVal).div(spotPrice).minus(1).times(100)
    // Hide when essentially at-market to avoid noise like "+0%".
    if (pct.abs().lt(0.01)) return null
    const rounded = pct.toFixed(pct.abs().gte(10) ? 0 : 2)
    const num = Number(rounded)
    if (num === 0) return null
    const sign = num > 0 ? "+" : ""
    const tone = num > 0 ? "positive" : "negative"
    return <SPctBadge tone={tone}>{`${sign}${rounded}%`}</SPctBadge>
  } catch {
    return null
  }
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
  const [selectedPill, setSelectedPill] = useState<
    "market" | "custom" | number
  >("market")
  // Guard to prevent onValueChange from treating programmatic updates as user edits.
  // Stores the last programmatically set value so we can compare in onValueChange
  // rather than relying on a counter that could desync if onValueChange doesn't fire.
  const programmaticPriceRef = useRef<string | null>(null)

  // Custom percentage pill state: user-typed signed percentage deviation from spot.
  // Stored as raw string so intermediate states like "-" or "" are preserved while typing.
  const [customPct, setCustomPct] = useState<string>("")
  const customPctInputRef = useRef<HTMLInputElement>(null)

  // Match swap page: trim trailing zeros, cap decimals based on magnitude.
  // Very small numbers (e < -6) use toPrecision to preserve significant digits.
  const formatAmount = (raw: Big) => {
    if (raw.eq(0)) return "0"
    let fixed: string
    if (raw.e >= 4) {
      fixed = raw.toFixed(2)
    } else if (raw.e < -6) {
      // Very small: preserve 6 significant digits to avoid rounding to zero
      fixed = raw.toPrecision(6)
    } else {
      fixed = raw.toFixed(6)
    }
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
      programmaticPriceRef.current = marketPrice
      setValue("limitPrice", marketPrice)
      setSelectedPill("market")
      const currentSellAmount = getValues("sellAmount")
      if (currentSellAmount) {
        recalculateBuyAmount(currentSellAmount, marketPrice)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketPrice, sellAsset?.id, buyAsset?.id, getValues, setValue])

  // Keep limit price synced to live anchor while a pill (Market or numeric ±%) is selected.
  // Both spot and market are invalidated every block via @block prefix, so this fires
  // each new block. Market pill tracks marketPrice; numeric pills track spot ± offset.
  // In "custom" (price-locked) mode, refreshes don't touch limitPrice.
  // Sell amount is sacred — always recalculates buy = sell × newPrice.
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

    programmaticPriceRef.current = next
    setValue("limitPrice", next)
    trigger("limitPrice")

    // Sell amount is sacred — always recalculate buy from sell × price.
    const currentSellAmount = getValues("sellAmount")
    if (currentSellAmount) recalculateBuyAmount(currentSellAmount, next)
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
      programmaticPriceRef.current = marketPrice
      setValue("limitPrice", marketPrice)
    }
    setSelectedPill("market")
  }

  const handleSellAmountChange = (newSellAmount: string) => {
    if (!newSellAmount || Big(newSellAmount).eq(0)) {
      setValue("buyAmount", "")
      resetLimitToMarket()
      return
    }

    // Sell amount is sacred — price stays, derive buy = sell × price.
    recalculateBuyAmount(newSellAmount, getValues("limitPrice"))
  }

  const handleBuyAmountChange = (newBuyAmount: string) => {
    if (!newBuyAmount || Big(newBuyAmount).eq(0)) {
      setValue("buyAmount", newBuyAmount || "")
      const currentSell = getValues("sellAmount")
      if (!currentSell) resetLimitToMarket()
      return
    }

    const currentSell = getValues("sellAmount")
    if (currentSell && Big(currentSell).gt(0)) {
      // Sell amount is sacred — derive price = buy / sell.
      const derivedPrice = Big(newBuyAmount).div(currentSell)
      programmaticPriceRef.current = derivedPrice.toString()
      setValue("limitPrice", derivedPrice.toString())
      trigger("limitPrice")
      setSelectedPill("custom")
      setCustomPct("")
    } else {
      // Sell is empty — derive sell from buy / current price (market rate).
      const currentPrice = getValues("limitPrice")
      if (currentPrice && Big(currentPrice).gt(0)) {
        const derivedSell = Big(newBuyAmount).div(currentPrice)
        setValue("sellAmount", formatAmount(derivedSell))
        trigger("sellAmount")
        setSelectedPill("custom")
      }
    }
  }

  const handleLimitPriceChange = (internalLimitPrice: string) => {
    // Don't recalculate amounts while user is still typing a price
    // (e.g. editing "0.00197" → "0.00" mid-edit).
    if (!internalLimitPrice || Big(internalLimitPrice).eq(0)) return

    // Sell amount is sacred — always derive buy = sell × price.
    recalculateBuyAmount(getValues("sellAmount"), internalLimitPrice)
  }

  // Validate and apply a signed percentage typed into the custom pill.
  // Mirrors Matcha: reject keystrokes that would push the value out of range.
  const handleCustomPctChange = (raw: string) => {
    // Allow: empty, lone sign, or optional sign + up to 4 digits.
    if (!/^[+-]?\d{0,4}$/.test(raw)) return

    // Empty or lone sign: keep as-is but don't touch the price yet.
    if (raw === "" || raw === "-" || raw === "+") {
      setCustomPct(raw)
      return
    }

    const num = Number(raw)
    if (Number.isNaN(num)) return
    // Reject out-of-range keystrokes to mimic Matcha's typing clamp.
    if (num < CUSTOM_PCT_MIN || num > CUSTOM_PCT_MAX) return

    setCustomPct(raw)

    // Apply to price: new price = spot × (1 + pct/100).
    const spot = spotPriceData?.spotPrice
    if (!spot) return
    const factor = 1 + num / 100
    if (factor <= 0) return
    const adjustedPrice = Big(spot).times(factor).toString()

    lastSyncedPriceRef.current = adjustedPrice
    programmaticPriceRef.current = adjustedPrice
    setValue("limitPrice", adjustedPrice)
    trigger("limitPrice")
    setSelectedPill("custom")

    // Sell amount is sacred — recalc buy from new price.
    const currentSellAmount = getValues("sellAmount")
    if (currentSellAmount)
      recalculateBuyAmount(currentSellAmount, adjustedPrice)
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
    // Clear the custom pill when a preset pill is clicked.
    setCustomPct("")
    // Record the price so the live-sync effect doesn't immediately re-fire
    lastSyncedPriceRef.current = adjustedPrice
    programmaticPriceRef.current = adjustedPrice
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
        <Flex align="center" gap="s" mb="s">
          <Text
            fw={500}
            fs="p5"
            color={getToken("text.medium")}
            style={{ whiteSpace: "nowrap" }}
          >
            {t("trade:limit.limitPrice.label")}
          </Text>
          <PriceDeviationBadge
            spotPrice={spotPriceData?.spotPrice ?? null}
            active={selectedPill === "custom"}
          />
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
                    !field.value
                      ? ""
                      : /e/i.test(field.value)
                        ? formatNumber(field.value, undefined, {
                            useGrouping: false,
                          })
                        : field.value
                  }
                  onValueChange={({ value }) => {
                    // Skip programmatic updates — compare against the last
                    // value we set to avoid treating it as a user edit.
                    if (programmaticPriceRef.current !== null) {
                      programmaticPriceRef.current = null
                      return
                    }
                    // Treat empty / zero as intermediate editing state — don't
                    // clear amount fields while user is still typing.
                    const parsed = value ? value : "0"
                    field.onChange(parsed)
                    setSelectedPill("custom")
                    // Clear the custom pill when user types price directly —
                    // deviation is shown in the separate badge instead.
                    setCustomPct("")
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

        <Flex gap="s" mt="m" justify="center" style={{ flexWrap: "wrap" }}>
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
          {(() => {
            const customNum =
              customPct === "" || customPct === "-" || customPct === "+"
                ? null
                : Number(customPct)
            const isNegative = customNum !== null && customNum < 0
            const isPositive = customNum !== null && customNum > 0
            const tone = isPositive
              ? ("positive" as const)
              : isNegative
                ? ("negative" as const)
                : undefined
            return (
              <SPriceOption
                as="label"
                tone={tone}
                active={selectedPill === "custom" && customPct !== "" && !tone}
                style={{ cursor: "text", gap: 2 }}
                onClick={() => customPctInputRef.current?.focus()}
              >
                {isNegative ? (
                  <ArrowDown size={9} />
                ) : isPositive ? (
                  <ArrowUp size={9} />
                ) : (
                  <Pencil size={9} />
                )}
                <SCustomPctInput
                  ref={customPctInputRef}
                  inputMode="numeric"
                  value={customPct}
                  onChange={(e) => handleCustomPctChange(e.target.value)}
                  placeholder="0"
                />
                %
              </SPriceOption>
            )
          })()}
        </Flex>
      </Box>

      <Separator />
      <Flex align="center" justify="space-between" py="m">
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

      <Separator />
      <Flex align="center" justify="space-between" py="m">
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
