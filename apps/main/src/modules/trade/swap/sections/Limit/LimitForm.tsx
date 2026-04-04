import {
  Box,
  Flex,
  Icon,
  NumberInput,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatNumber, SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { ArrowDown, ArrowLeftRight, ArrowUp, Pencil, X } from "lucide-react"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPriceQuery } from "@/api/spotPrice"
import { bestSellQuery } from "@/api/trade"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  SCustomPctInput,
  SCustomPill,
  SDenominationPill,
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

// Percentage offsets shown as pills. Factors are derived per-render based on isPriceInverted.
const PILL_PCTS = [2, 5, 10] as const

// Buffer applied to "Best" (market) pill: sets limit slightly below spot so the order
// can be filled via AMM routing even without a CoW match (accounts for price impact).
const BEST_PILL_BUFFER = 0.005 // 0.5% below spot in internal (buyAsset/sellAsset) terms

export const LimitForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { tradable, getAsset } = useAssets()
  const navigate = useNavigate()
  const switchAssets = useSwitchAssets()

  const { control, getValues, setValue, reset, trigger, watch } =
    useFormContext<LimitFormValues>()

  const [sellAsset, buyAsset, limitPrice, sellAmount, buyAmountVal] = watch([
    "sellAsset",
    "buyAsset",
    "limitPrice",
    "sellAmount",
    "buyAmount",
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

  // Derive "Best" price from the swap quote (effective execution rate).
  // bestPrice = amountOut / sellAmount (in human-readable units = buyAsset per sellAsset).
  // Falls back to spot × (1 - buffer) when no sell amount or quote unavailable.
  const bestPrice = useMemo(() => {
    if (bestSellData && sellAmount && Big(sellAmount).gt(0) && buyAsset) {
      const amountOutHuman = scaleHuman(
        bestSellData.amountOut,
        buyAsset.decimals,
      )
      if (amountOutHuman && Big(amountOutHuman).gt(0)) {
        return Big(amountOutHuman).div(sellAmount).toString()
      }
    }
    // Fallback: spot price with buffer
    if (spotPriceData?.spotPrice) {
      return Big(spotPriceData.spotPrice)
        .times(1 - BEST_PILL_BUFFER)
        .toString()
    }
    return null
  }, [bestSellData, sellAmount, buyAsset, spotPriceData?.spotPrice])

  // selectedFactor: 1 = Market, 0 = custom/manual, else a specific pill factor
  const [selectedFactor, setSelectedFactor] = useState<number>(1)
  // isPriceInverted=true: display = sellAsset per buyAsset (1/internal)
  // isPriceInverted=false: display = buyAsset per sellAsset (internal)
  const [isPriceInverted, setIsPriceInverted] = useState(false)
  const [customPct, setCustomPct] = useState<string>("0")

  // Guards to prevent onValueChange from treating programmatic updates as user edits
  const programmaticPriceRef = useRef(false)
  const denominationChangingRef = useRef(false)
  // Tracks whether buy amount was last edited by user (prevents live-sync overwriting it)
  const buyEditedRef = useRef(false)

  // Reset display direction when assets change
  useEffect(() => {
    setIsPriceInverted(false)
  }, [sellAsset?.id, buyAsset?.id])

  // Displayed symbol (numerator of the price ratio shown to user)
  // Denomination pill / input label: shows the current display unit (numerator of the price ratio)
  const displaySymbol = isPriceInverted ? sellAsset?.symbol : buyAsset?.symbol

  // Arrow icon direction for "better" pills: inverted display goes down, non-inverted goes up
  const PillArrowIcon = isPriceInverted ? ArrowDown : ArrowUp

  // Each pill factor: for inverted display, "better" = lower displayed = lower internal factor
  const pillAdjustments = PILL_PCTS.map((pct) => ({
    pct,
    factor: isPriceInverted ? 1 - pct / 100 : 1 + pct / 100,
  }))

  // Convert internal price (buyAsset per sellAsset) to displayed value
  const toDisplayPrice = (internal: string) => {
    if (!internal || Big(internal).eq(0)) return ""
    const raw = isPriceInverted ? Big(1).div(internal).toString() : internal
    return formatNumber(raw, undefined, { useGrouping: false })
  }

  // Convert displayed price back to internal (buyAsset per sellAsset)
  const toInternalPrice = (displayed: string) => {
    if (!displayed || Big(displayed).eq(0)) return ""
    return isPriceInverted ? Big(1).div(displayed).toString() : displayed
  }

  // Round to 5 significant digits for display of calculated amounts
  const toSignificant = (value: string, digits = 5) => {
    const n = Big(value)
    if (n.eq(0)) return "0"
    return n.toPrecision(digits)
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
    setValue(
      "buyAmount",
      toSignificant(
        Big(currentSellAmount).times(internalLimitPrice).toString(),
      ),
    )
  }

  // % deviation from spot, symmetric across denomination toggle.
  // Computed from internal prices (buyAsset per sellAsset), sign flipped for inverted display.
  const pctFromMarket = useMemo(() => {
    if (!limitPrice || !spotPriceData?.spotPrice || Big(limitPrice).eq(0))
      return null
    const market = Big(spotPriceData.spotPrice)
    const limit = Big(limitPrice)
    if (market.eq(0)) return null
    const internalPct = limit.div(market).minus(1).times(100)
    return isPriceInverted ? internalPct.neg() : internalPct
  }, [limitPrice, spotPriceData?.spotPrice, isPriceInverted])

  // Treat as "at market" when Market pill is explicitly selected or deviation is negligible
  const isAtMarket =
    selectedFactor === 1 ||
    (pctFromMarket !== null && pctFromMarket.abs().lt(0.01))

  // Prefill limit price on initial load or asset change
  const prevAssetsRef = useRef<string>("")
  useEffect(() => {
    const assetsKey = `${sellAsset?.id}-${buyAsset?.id}`
    const assetsChanged = prevAssetsRef.current !== assetsKey
    prevAssetsRef.current = assetsKey

    if (!bestPrice) return

    const currentLimitPrice = getValues("limitPrice")
    if (!currentLimitPrice || assetsChanged) {
      programmaticPriceRef.current = true
      setValue("limitPrice", bestPrice)
      setSelectedFactor(1)
      const currentSellAmount = getValues("sellAmount")
      if (currentSellAmount) {
        recalculateBuyAmount(currentSellAmount, bestPrice)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestPrice, sellAsset?.id, buyAsset?.id, getValues, setValue])

  // Keep limit price synced to live quote every block while Best pill is selected
  useEffect(() => {
    if (selectedFactor !== 1 || !bestPrice) return

    programmaticPriceRef.current = true
    setValue("limitPrice", bestPrice)
    trigger("limitPrice")

    // Only recalculate buy if the user didn't manually edit it
    if (!buyEditedRef.current) {
      const currentSellAmount = getValues("sellAmount")
      if (currentSellAmount) recalculateBuyAmount(currentSellAmount, bestPrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestPrice, selectedFactor, setValue, trigger, getValues])

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

  const resetLimitToBest = () => {
    if (bestPrice) {
      programmaticPriceRef.current = true
      setValue("limitPrice", bestPrice)
    }
    setSelectedFactor(1)
  }

  const handleSellAmountChange = (newSellAmount: string) => {
    buyEditedRef.current = false
    if (!newSellAmount) {
      setValue("buyAmount", "")
      resetLimitToBest()
      return
    }
    recalculateBuyAmount(newSellAmount, getValues("limitPrice"))
  }

  const handleBuyAmountChange = (newBuyAmount: string) => {
    buyEditedRef.current = true
    // Buy edited → recalculate sell (sell = buy / limitPrice), keep limit price fixed
    // Buy cleared → clear sell too
    if (!newBuyAmount) {
      setValue("sellAmount", "")
      buyEditedRef.current = false
      resetLimitToBest()
      return
    }
    const currentLimitPrice = getValues("limitPrice")
    if (currentLimitPrice && !Big(currentLimitPrice).eq(0)) {
      setValue(
        "sellAmount",
        toSignificant(Big(newBuyAmount).div(currentLimitPrice).toString()),
      )
    }
  }

  const handleLimitPriceChange = (internalLimitPrice: string) => {
    recalculateBuyAmount(getValues("sellAmount"), internalLimitPrice)
  }

  const handlePriceAdjustment = (factor: number) => {
    const marketPrice = spotPriceData?.spotPrice
    if (!marketPrice) return

    setSelectedFactor(factor)
    programmaticPriceRef.current = true
    const adjustedPrice =
      factor === 1
        ? (bestPrice ??
          Big(marketPrice)
            .times(1 - BEST_PILL_BUFFER)
            .toString())
        : isPriceInverted
          ? Big(marketPrice).div(factor).toString()
          : Big(marketPrice).times(factor).toString()
    setValue("limitPrice", adjustedPrice)
    trigger("limitPrice")
    handleLimitPriceChange(adjustedPrice)
  }

  // Custom pill: pct is the displayed % deviation from market (positive = above displayed market)
  const handleCustomPctChange = (pct: string) => {
    setCustomPct(pct)
    const pctNum = parseFloat(pct)
    if (isNaN(pctNum) || !spotPriceData?.spotPrice) return
    const factor = 1 + pctNum / 100
    if (factor <= 0) return
    const marketPrice = spotPriceData.spotPrice
    programmaticPriceRef.current = true
    const adjustedPrice = isPriceInverted
      ? Big(marketPrice).div(factor).toString()
      : Big(marketPrice).times(factor).toString()
    setValue("limitPrice", adjustedPrice)
    trigger("limitPrice")
    handleLimitPriceChange(adjustedPrice)
  }

  const handleCustomPillClick = () => {
    setSelectedFactor(0)
    if (pctFromMarket !== null) {
      setCustomPct(pctFromMarket.toFixed(2))
    }
  }

  const handleDenominationToggle = () => {
    denominationChangingRef.current = true
    setIsPriceInverted((prev) => !prev)
    // Do NOT reset selectedFactor — the internal limitPrice is unchanged,
    // only the display direction flips (toDisplayPrice inverts the value).
  }

  const handleClear = () => {
    buyEditedRef.current = false
    setValue("sellAmount", "")
    setValue("buyAmount", "")
    resetLimitToBest()
  }

  const hasClearableAmounts = !!sellAmount || !!buyAmountVal

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

      {hasClearableAmounts && (
        <Flex justify="flex-end" mt="xs">
          <button
            type="button"
            onClick={handleClear}
            style={{
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Icon size="xs" component={X} />
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {t("common:clear")}
            </Text>
          </button>
        </Flex>
      )}

      <SwapSectionSeparator />

      <Box pt="l" pb="m">
        <Flex align="center" gap="s" mb="s">
          <Text fw={500} fs="p5" color={getToken("text.low")}>
            {displaySymbol} {t("trade:limit.limitPrice.label")}
          </Text>
          <SPctBadge
            style={{
              visibility:
                !isAtMarket && pctFromMarket !== null ? "visible" : "hidden",
            }}
          >
            {pctFromMarket !== null ? (
              <>
                {pctFromMarket.gt(0) ? "+" : ""}
                {pctFromMarket.toFixed(1)}%
              </>
            ) : (
              "0.0%"
            )}
          </SPctBadge>
        </Flex>
        <Flex gap="xxs" mb="m" wrap>
          <SPriceOption
            active={selectedFactor === 1}
            onClick={() => handlePriceAdjustment(1)}
          >
            {t("trade:limit.market")}
          </SPriceOption>
          {pillAdjustments.map(({ pct, factor }) => (
            <SPriceOption
              key={pct}
              active={selectedFactor === factor}
              onClick={() => handlePriceAdjustment(factor)}
            >
              <Icon size="xs" component={PillArrowIcon} />
              {pct}%
            </SPriceOption>
          ))}
          <SCustomPill
            active={selectedFactor === 0}
            onClick={handleCustomPillClick}
          >
            <Icon size="xs" component={Pencil} />
            <SCustomPctInput
              type="number"
              value={customPct}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setSelectedFactor(0)
                handleCustomPctChange(e.target.value)
              }}
            />
            %
          </SCustomPill>
        </Flex>

        <Controller
          control={control}
          name="limitPrice"
          render={({ field }) => (
            <NumberInput
              value={toDisplayPrice(field.value)}
              onValueChange={({ value }) => {
                if (programmaticPriceRef.current) {
                  programmaticPriceRef.current = false
                  return
                }
                if (denominationChangingRef.current) {
                  denominationChangingRef.current = false
                  return
                }
                const internal = toInternalPrice(value)
                field.onChange(internal)
                setSelectedFactor(0)
                handleLimitPriceChange(internal)
              }}
              leadingElement={
                <SDenominationPill onClick={handleDenominationToggle}>
                  <Icon size="s" component={ArrowLeftRight} />
                  {displaySymbol}
                </SDenominationPill>
              }
              allowNegative={false}
              sx={{ textAlign: "right" }}
            />
          )}
        />

        <Text
          fw={400}
          fs="p5"
          color={getToken("text.low")}
          mt="xs"
          style={{
            visibility:
              !isAtMarket && spotPriceData?.spotPrice ? "visible" : "hidden",
          }}
        >
          {t("trade:limit.spot")}:{" "}
          {spotPriceData?.spotPrice
            ? toDisplayPrice(spotPriceData.spotPrice)
            : "\u00A0"}
        </Text>
      </Box>

      <Flex align="center" gap="s" pb="m">
        <Text fw={500} fs="p5" color={getToken("text.low")}>
          {t("trade:limit.expiry.label")}
        </Text>
        <Flex gap="xxs" ml="auto">
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
    </Box>
  )
}
