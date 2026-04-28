import { useTheme } from "@emotion/react"
import { ArrowLeftRight, CircleInfo } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  MicroButton,
  Skeleton,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Pencil, X } from "lucide-react"
import { FC, MouseEvent, useCallback, useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import {
  computeDerived,
  getDerived,
  updateLastTwoOnTouch,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"
import { formatCalcValue } from "@/modules/trade/swap/sections/Limit/limitUtils"
import {
  EXPIRY_OPTIONS,
  LimitFormValues,
} from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

import {
  SBulletList,
  SCustomPill,
  SMarketButton,
  SMarketPrice,
  SPercentSuffix,
  SPillActions,
  SPillInlineInput,
  SPillSeparator,
  SPillSliceButton,
  SPillTrigger,
  SPriceInput,
} from "./LimitPriceSection.styled"

type Props = {
  readonly marketPrice: string | null
}

export const LimitPriceSection: FC<Props> = ({ marketPrice }) => {
  const theme = useTheme()
  const { t } = useTranslation(["trade", "common"])
  const { watch, setValue, getValues, trigger } =
    useFormContext<LimitFormValues>()

  const [
    limitPrice,
    sellAsset,
    buyAsset,
    expiry,
    partiallyFillable,
    priceAnchor,
  ] = watch([
    "limitPrice",
    "sellAsset",
    "buyAsset",
    "expiry",
    "partiallyFillable",
    "priceAnchor",
  ])

  // Denomination toggle: "normal" = 1 SELL = X BUY, "inverted" = 1 BUY = X SELL
  const [isInverted, setIsInverted] = useState(false)

  // Last raw text the user typed into the pill — used to repopulate
  // the input on re-open so the value isn't lost between edit sessions.
  const [lastPillValue, setLastPillValue] = useState("")

  /**
   * When the user sets a % via the pill we store the exact typed number
   * here and use it for the deviation display instead of re-deriving
   * it from the rounded limitPrice. Otherwise rounding in
   * `formatCalcValue(market × (1+pct/100))` would make "15%" redisplay
   * as "15.01%" (or "14.99%") depending on which way the rounding went.
   *
   * `null` = no user pct currently in effect → fall back to computed
   * deviation from limitPrice vs marketPrice.
   */
  const [userPct, setUserPct] = useState<number | null>(null)

  // Reset any remembered pill-% when the pair changes — a 5% deviation
  // from HDX/USDC doesn't carry meaning over to, say, ETH/USDT.
  useEffect(() => {
    setUserPct(null)
    setLastPillValue("")
  }, [sellAsset?.id, buyAsset?.id])

  // If limitPrice drifts from what the remembered userPct would predict
  // (market × (1 + userPct/100)), the cached pct is stale — typically
  // because price was re-derived from the two amounts after an amount
  // edit. Clear it so the pill shows the true deviation instead of the
  // old user-entered %. Small tolerance absorbs formatCalcValue rounding.
  useEffect(() => {
    if (userPct === null || !marketPrice || !limitPrice) return
    try {
      const expected = new Big(marketPrice).times(
        Big(1).plus(Big(userPct).div(100)),
      )
      if (expected.lte(0)) return
      const actual = new Big(limitPrice)
      const drift = actual.minus(expected).abs().div(expected)
      if (drift.gt(0.0001)) {
        setUserPct(null)
        setLastPillValue("")
      }
    } catch {
      setUserPct(null)
      setLastPillValue("")
    }
  }, [limitPrice, marketPrice, userPct])

  // When the user types in the price field we store their raw input here
  // so the NumberInput displays exactly what they typed (no round-trip
  // through Big.js + formatCalcValue which can mangle digits).
  // `canonical` is the limitPrice value we wrote at the same time; on
  // every render we check that limitPrice still matches — if an external
  // source (market prefill, asset reset, sell-sacred recalc) has changed
  // it, we ignore the cached user input and format the new value.
  const userInputRef = useRef<{
    value: string
    inverted: boolean
    canonical: string
  } | null>(null)

  const displayPrice = (() => {
    const user = userInputRef.current
    if (user && user.inverted === isInverted && user.canonical === limitPrice) {
      return user.value
    }
    if (!limitPrice) return ""
    try {
      const value = isInverted
        ? Big(1).div(new Big(limitPrice))
        : new Big(limitPrice)
      if (value.lte(0)) return ""
      return formatCalcValue(value)
    } catch {
      return ""
    }
  })()

  const denomAssetIdForFiat = (isInverted ? sellAsset?.id : buyAsset?.id) ?? ""

  const priceHumanForFiat = (() => {
    if (!displayPrice.trim()) return null
    try {
      const n = new Big(displayPrice.replace(/\s/g, "").replace(",", "."))
      return n.gt(0) ? n.toString() : null
    } catch {
      return null
    }
  })()

  const [priceFiatDisplay, { isLoading: priceFiatLoading }] =
    useDisplayAssetPrice(denomAssetIdForFiat, priceHumanForFiat ?? "0", {
      compact: true,
      maximumFractionDigits: 2,
    })

  const showPriceFiatRow = Boolean(denomAssetIdForFiat && priceHumanForFiat)

  // ── Deviation from market price ──
  const deviation = (() => {
    if (!limitPrice || !marketPrice) return null
    try {
      const limit = new Big(limitPrice)
      const market = new Big(marketPrice)
      if (market.lte(0)) return null
      return limit.minus(market).div(market).times(100).toNumber()
    } catch {
      return null
    }
  })()

  // ── "Market" price display value (same formatting as price field) ──
  const marketDisplayValue = (() => {
    if (!marketPrice) return null
    try {
      const raw = isInverted
        ? Big(1).div(new Big(marketPrice))
        : new Big(marketPrice)
      if (raw.lte(0)) return null
      return formatCalcValue(raw)
    } catch {
      return null
    }
  })()

  /**
   * Apply a price change through the cascade: mark "price" as the
   * most-recent touch, then recompute whichever field falls out of
   * the kept pair (the new derived field).
   */
  const applyPriceTouch = useCallback(
    (newLimitPrice: string, nextPriceAnchor: "user" | "market") => {
      const values = getValues()
      const lastTwo = updateLastTwoOnTouch(
        values.lastTwo,
        "price",
        values.isLocked,
      )
      if (lastTwo !== values.lastTwo) setValue("lastTwo", lastTwo)
      setValue("priceAnchor", nextPriceAnchor)
      setValue("limitPrice", newLimitPrice)

      const derived = getDerived(lastTwo)
      if (derived === "price") {
        // Price is now derived — shouldn't happen since we just touched
        // it. Defensive no-op.
        trigger()
        return
      }
      const computed = computeDerived(derived, {
        sell: values.sellAmount ?? "",
        buy: values.buyAmount ?? "",
        price: newLimitPrice,
      })
      if (derived === "buy") setValue("buyAmount", computed ?? "")
      else if (derived === "sell") setValue("sellAmount", computed ?? "")
      trigger()
    },
    [getValues, setValue, trigger],
  )

  // ── Price input change handler ──
  const handlePriceChange = useCallback(
    (displayValue: string) => {
      let newLimitPrice: string
      if (!isInverted) {
        newLimitPrice = displayValue
      } else {
        try {
          const p = new Big(displayValue)
          if (p.lte(0)) return
          // Store at full precision so flipping back round-trips cleanly.
          newLimitPrice = Big(1).div(p).toString()
        } catch {
          return
        }
      }

      userInputRef.current = {
        value: displayValue,
        inverted: isInverted,
        canonical: newLimitPrice,
      }
      // Typing the price directly invalidates any remembered pill %.
      setUserPct(null)
      applyPriceTouch(newLimitPrice, "user")
    },
    [isInverted, applyPriceTouch],
  )

  // ── "Market" reset button ──
  const handleSetMarketPrice = useCallback(() => {
    if (!marketPrice) return
    userInputRef.current = null
    setLastPillValue("")
    setUserPct(null)
    applyPriceTouch(marketPrice, "market")
  }, [marketPrice, applyPriceTouch])

  const handlePillDeviationReset = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      event.preventDefault()
      setIsEditingPill(false)
      handleSetMarketPrice()
    },
    [handleSetMarketPrice],
  )

  // ── Inline editing mode for custom pill ──
  const [isEditingPill, setIsEditingPill] = useState(false)
  const pillInputRef = useRef<HTMLInputElement>(null)

  const handlePillEditStart = useCallback(() => {
    setIsEditingPill(true)
    setTimeout(() => pillInputRef.current?.focus(), 0)
  }, [])

  /**
   * Apply a percentage-deviation value to the form without exiting edit
   * mode. Called on every keystroke so the price and receive amount
   * update live as the user types the percentage. Handles these cases:
   *
   *   - Empty / whitespace → resume mirroring market (priceAnchor = "market")
   *   - Valid percentage    → set limitPrice = market × (1 + pct/100),
   *                           priceAnchor = "user"
   *   - Invalid / partial   → silently skip (last valid state stays,
   *                           so typing "5", then "5.", the latter is
   *                           a no-op)
   *   - `pct ≤ -100`        → silently skip (would produce a zero or
   *                           negative price, economically nonsensical)
   */
  const applyPillValue = useCallback(
    (value: string) => {
      if (!marketPrice) return
      const trimmed = value.trim()
      if (!trimmed) {
        userInputRef.current = null
        setUserPct(null)
        applyPriceTouch(marketPrice, "market")
        return
      }
      try {
        const pct = new Big(trimmed)
        if (pct.lte(-100)) return
        const market = new Big(marketPrice)
        const newRaw = market.times(Big(1).plus(pct.div(100)))
        if (newRaw.lte(0)) return
        const newPrice = formatCalcValue(newRaw)
        userInputRef.current = null
        setUserPct(pct.toNumber())
        applyPriceTouch(newPrice, "user")
      } catch {
        // ignore — partial input like "5." or "-" is not yet valid
      }
    },
    [marketPrice, applyPriceTouch],
  )

  const handlePillEditCommit = useCallback(
    (value: string) => {
      setIsEditingPill(false)
      applyPillValue(value)
      // Persist the raw text so re-opening the editor shows it again.
      setLastPillValue(value.trim())
    },
    [applyPillValue],
  )

  // ── Deviation display for pill ──
  // Prefer the user's typed % verbatim (avoids the "15" → "15.01"
  // drift from rounding). Fall back to computed deviation otherwise.
  const deviationDisplay = (() => {
    if (userPct !== null) {
      const sign = userPct > 0 ? "+" : ""
      return `${sign}${userPct.toFixed(2)}%`
    }
    if (deviation === null) return "0%"
    const sign = deviation > 0 ? "+" : ""
    return `${sign}${deviation.toFixed(2)}%`
  })()

  const signedDeviationPct = userPct ?? deviation ?? 0

  const showResetAction =
    priceAnchor === "user" && Boolean(marketPrice) && !isEditingPill

  return (
    <Flex direction="column">
      <Flex direction="column" gap="xs" sx={{ paddingBlock: theme.sizes.l }}>
        <Flex justify="space-between" align="center">
          <Text fw={500} fs="p5" lh="s" color={getToken("text.medium")}>
            {t("trade:limit.priceLabel", {
              symbol: isInverted
                ? (buyAsset?.symbol ?? "")
                : (sellAsset?.symbol ?? ""),
            })}
          </Text>
          <Flex align="center" gap="s">
            <SCustomPill
              isActive={isEditingPill}
              tone={
                signedDeviationPct > 0
                  ? "positive"
                  : signedDeviationPct < 0
                    ? "negative"
                    : "neutral"
              }
            >
              {isEditingPill ? (
                <>
                  <SPillInlineInput
                    getInputRef={pillInputRef}
                    defaultValue={lastPillValue}
                    placeholder={deviationDisplay.replace("%", "")}
                    onFocus={(e) => e.target.select()}
                    // Live-recalc on every keystroke: price & receive
                    // amount reflect the typed % immediately without
                    // waiting for Enter/blur. Matches Matcha's behaviour.
                    onBlur={(e) => handlePillEditCommit(e.target.value)}
                    onValueChange={({ value }) => applyPillValue(value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handlePillEditCommit(
                          (e.target as HTMLInputElement).value,
                        )
                      }
                      if (e.key === "Escape") {
                        setIsEditingPill(false)
                      }
                    }}
                  />
                  <SPercentSuffix>%</SPercentSuffix>
                </>
              ) : (
                <>
                  <SPillTrigger
                    type="button"
                    onClick={handlePillEditStart}
                    aria-label={t("trade:limit.deviation.editAria")}
                  >
                    {deviationDisplay}
                  </SPillTrigger>
                  <SPillActions>
                    <SPillSeparator aria-hidden />
                    {showResetAction ? (
                      <SPillSliceButton
                        type="button"
                        onClick={handlePillDeviationReset}
                        aria-label={t("trade:limit.deviation.resetAria")}
                      >
                        <X />
                      </SPillSliceButton>
                    ) : (
                      <SPillSliceButton
                        type="button"
                        tabIndex={-1}
                        aria-hidden
                        onClick={(e) => {
                          e.preventDefault()
                          handlePillEditStart()
                        }}
                      >
                        <Pencil />
                      </SPillSliceButton>
                    )}
                  </SPillActions>
                </>
              )}
            </SCustomPill>
          </Flex>
        </Flex>

        <Flex align="center" gap="s">
          <Button
            variant="tertiary"
            size="medium"
            outline
            onClick={() => setIsInverted((prev) => !prev)}
          >
            <Icon
              component={ArrowLeftRight}
              size="m"
              color={getToken("icons.onContainer")}
            />
          </Button>
          <Flex
            direction="column"
            flex={1}
            minWidth={0}
            align="flex-end"
            gap="xs"
          >
            <Flex
              align="center"
              width="100%"
              gap="xs"
              minWidth={0}
              justify="flex-end"
              pt="base"
            >
              <SPriceInput
                variant="embedded"
                customSize="small"
                value={displayPrice}
                allowNegative={false}
                onValueChange={({ value }, { source }) => {
                  if (source === "prop") return
                  handlePriceChange(value)
                }}
                onFocus={(e) => e.target.select()}
                placeholder="0"
              />
              <Text
                fw={600}
                fs="p2"
                lh="s"
                color={getToken("text.medium")}
                whiteSpace="nowrap"
              >
                {isInverted
                  ? (sellAsset?.symbol ?? "")
                  : (buyAsset?.symbol ?? "")}
              </Text>
            </Flex>
            {showPriceFiatRow && (
              <Text
                fs="p6"
                lh="s"
                fw={400}
                color={getToken("text.low")}
                truncate
                mt="-s"
              >
                {priceFiatLoading ? (
                  <Skeleton
                    width={72}
                    height={12}
                    sx={{ display: "inline-block" }}
                  />
                ) : (
                  priceFiatDisplay
                )}
              </Text>
            )}
          </Flex>
        </Flex>

        {/* "Market" reset — extra top margin vs fiat so it's clearly separated from the $ line */}
        {marketDisplayValue && (
          <Flex justify="flex-end" mt="m">
            <SMarketButton type="button" onClick={handleSetMarketPrice}>
              <Trans
                i18nKey="trade:limit.market"
                values={{ value: marketDisplayValue }}
                components={{ marketPrice: <SMarketPrice /> }}
              />
            </SMarketButton>
          </Flex>
        )}
      </Flex>

      <SwapSectionSeparator />

      <Flex justify="space-between" align="center" gap="base" py="m" wrap>
        <Text
          fw={500}
          fs="p5"
          whiteSpace="nowrap"
          lh="s"
          color={getToken("text.medium")}
        >
          {t("trade:limit.expiry")}
        </Text>
        <Flex gap="s" justify="flex-end" width={["100%", "auto"]}>
          {EXPIRY_OPTIONS.map((option) => (
            <MicroButton
              key={option}
              onClick={() => setValue("expiry", option)}
              variant={expiry === option ? "emphasis" : "low"}
              sx={{ flex: [1, "auto"] }}
            >
              <Text
                as="span"
                whiteSpace="nowrap"
                py="xs"
                color={expiry === option ? undefined : getToken("text.high")}
              >
                {t(`trade:limit.expiry.${option}`)}
              </Text>
            </MicroButton>
          ))}
        </Flex>
      </Flex>

      <SwapSectionSeparator />

      <Flex justify="space-between" align="center" py="m">
        <Text fw={500} fs="p5" color={getToken("text.medium")}>
          {t("trade:limit.partiallyFillable")}
        </Text>
        <Flex align="center" gap="base">
          <Tooltip
            side="top"
            asChild
            text={
              <Flex direction="column" gap="s">
                <Text fs="p5" fw={500}>
                  {t("trade:limit.partiallyFillable.tooltip.intro")}
                </Text>
                <SBulletList>
                  <Text as="li" fw={500} fs="p5">
                    {t("trade:limit.partiallyFillable.tooltip.partial")}
                  </Text>
                  <Text as="li" fw={500} fs="p5">
                    {t("trade:limit.partiallyFillable.tooltip.fillOrKill")}
                  </Text>
                </SBulletList>
              </Flex>
            }
          >
            <Flex align="center" gap="s">
              <Icon
                component={CircleInfo}
                size="s"
                color={getToken("text.tint.secondary")}
              />
              <Text
                fw={500}
                fs="p5"
                color={
                  partiallyFillable
                    ? getToken("text.tint.secondary")
                    : getToken("text.low")
                }
              >
                {t("trade:limit.partiallyFillable.enabled")}
              </Text>
            </Flex>
          </Tooltip>

          <ToggleRoot>
            <Toggle
              name="partiallyFillable"
              checked={partiallyFillable}
              onCheckedChange={(checked) =>
                setValue("partiallyFillable", !!checked)
              }
            />
            <ToggleLabel hidden>
              {t("trade:limit.partiallyFillable")}
            </ToggleLabel>
          </ToggleRoot>
        </Flex>
      </Flex>
    </Flex>
  )
}
