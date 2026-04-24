import { css, useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  NumberInput,
  Skeleton,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Pencil, X } from "lucide-react"
import { FC, MouseEvent, useCallback, useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { formatCalcValue } from "@/modules/trade/swap/sections/Limit/limitUtils"
import {
  EXPIRY_OPTIONS,
  LimitFormValues,
} from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

/** vs prior `size="2xs"` (~8px): ×1.3 (see `theme.sizes["2xs"]`). */
const PILL_SLICE_ICON_SIZE = 8 * 1.3

/** Edit / close icon column — shared by both `SPillSliceButton` instances (~20% under 34px). */
const SPILL_SLICE_BUTTON_WIDTH_PX = 27

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
  // source (spot prefill, asset reset, sell-sacred recalc) has changed
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

  const denominationSuffix = isInverted
    ? (sellAsset?.symbol ?? "")
    : (buyAsset?.symbol ?? "")

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

  // ── Spot price display value (same formatting as price field) ──
  const spotDisplayValue = (() => {
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
   * Recalculate the non-anchored amount from the new price.
   * Anchor rule:
   *   - Lock ON → always sell-sacred: keep sell, recalc buy (buy = sell × price)
   *   - Lock OFF, anchor = "sell" → keep sell, recalc buy
   *   - Lock OFF, anchor = "buy"  → keep buy, recalc sell (sell = buy / price)
   * Degenerate cases: if only one amount is filled, treat it as the anchor.
   */
  const recalcFromPrice = useCallback(
    (price: string) => {
      if (!price) {
        trigger()
        return
      }
      try {
        const p = new Big(price)
        if (p.lte(0)) {
          trigger()
          return
        }

        const values = getValues()
        const hasSell = !!values.sellAmount
        const hasBuy = !!values.buyAmount

        const keepBuy =
          !values.isLocked &&
          (values.amountAnchor === "buy" || (!hasSell && hasBuy))

        if (keepBuy && values.buyAmount) {
          // buy-anchored → sell = buy / price
          const newSell = new Big(values.buyAmount).div(p)
          setValue("sellAmount", formatCalcValue(newSell))
        } else if (values.sellAmount) {
          // sell-anchored (default / locked) → buy = sell × price
          const newBuy = new Big(values.sellAmount).times(p)
          setValue("buyAmount", formatCalcValue(newBuy))
        }
      } catch {
        // ignore invalid Big parses
      }
      trigger()
    },
    [getValues, setValue, trigger],
  )
  // Alias kept for callers below that still use the old name.
  const recalcBuy = recalcFromPrice

  // ── Price change handler ──
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
          // The non-inverted display path formats the value via
          // formatCalcValue so the raw ~20-digit string never reaches
          // the user.
          newLimitPrice = Big(1).div(p).toString()
        } catch {
          return
        }
      }

      // Remember exactly what the user typed so the input shows it back
      // unchanged (the canonical limitPrice may have been transformed).
      // canonical lets us detect external changes to limitPrice and
      // invalidate this cache without a stale-render.
      userInputRef.current = {
        value: displayValue,
        inverted: isInverted,
        canonical: newLimitPrice,
      }
      // User typed a custom price — stop auto-mirroring spot.
      setValue("priceAnchor", "user")
      setValue("limitPrice", newLimitPrice)
      // Typing the price directly invalidates any remembered pill %.
      setUserPct(null)
      // Both modes: price changed → recalc buy
      recalcBuy(newLimitPrice)
    },
    [isInverted, setValue, recalcBuy],
  )

  // ── Set limit price to spot/market price ──
  const handleSetSpotPrice = useCallback(() => {
    if (!marketPrice) return
    userInputRef.current = null
    // Resume mirroring spot live (next block will confirm via the
    // spot-mirroring effect in LimitFields, keeping them in sync).
    setValue("priceAnchor", "spot")
    setValue("limitPrice", marketPrice)
    recalcBuy(marketPrice)
    // Explicit reset wipes any remembered % — next edit starts clean.
    setLastPillValue("")
    setUserPct(null)
  }, [marketPrice, setValue, recalcBuy])

  const handlePillDeviationReset = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      event.preventDefault()
      setIsEditingPill(false)
      handleSetSpotPrice()
    },
    [handleSetSpotPrice],
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
   *   - Empty / whitespace → resume mirroring spot (priceAnchor = "spot")
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
        setValue("priceAnchor", "spot")
        setValue("limitPrice", marketPrice)
        recalcBuy(marketPrice)
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
        setValue("priceAnchor", "user")
        setValue("limitPrice", newPrice)
        recalcBuy(newPrice)
      } catch {
        // ignore — partial input like "5." or "-" is not yet valid
      }
    },
    [marketPrice, setValue, recalcBuy],
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

  /** Signed % vs market for styling (+ green / − red). */
  const signedDeviationPct = userPct ?? deviation ?? 0
  const pillTone: "neutral" | "positive" | "negative" =
    signedDeviationPct > 0
      ? "positive"
      : signedDeviationPct < 0
        ? "negative"
        : "neutral"

  const showResetAction =
    priceAnchor === "user" && Boolean(marketPrice) && !isEditingPill

  return (
    <Flex direction="column">
      {/* Price section — vertical padding uses sizes.l (20px token), not space.base. */}
      <Flex direction="column" gap="xs" sx={{ paddingBlock: theme.sizes.l }}>
        {/* Header: "When 1 HDX price is" (left) — custom % pill (right) */}
        <Flex justify="space-between" align="center">
          <Text fw={500} fs="p5" lh="s" color={getToken("text.medium")}>
            {t("trade:limit.priceLabel", {
              symbol: isInverted
                ? (buyAsset?.symbol ?? "")
                : (sellAsset?.symbol ?? ""),
            })}
          </Text>
          <Flex align="center" gap="s">
            {/* Custom % pill — same visual container in view & edit
                modes, only the numeric text becomes an inline input. */}
            <SCustomPill isActive={isEditingPill} tone={pillTone}>
              {isEditingPill ? (
                <>
                  <SPillInlineInput
                    ref={pillInputRef}
                    type="text"
                    defaultValue={lastPillValue}
                    placeholder={deviationDisplay.replace("%", "")}
                    onFocus={(e) => e.target.select()}
                    // Live-recalc on every keystroke: price & receive
                    // amount reflect the typed % immediately without
                    // waiting for Enter/blur. Matches Matcha's behaviour.
                    onChange={(e) => applyPillValue(e.target.value)}
                    onBlur={(e) => handlePillEditCommit(e.target.value)}
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
                        <Icon component={X} size={PILL_SLICE_ICON_SIZE + 2} />
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
                        <Icon component={Pencil} size={PILL_SLICE_ICON_SIZE} />
                      </SPillSliceButton>
                    )}
                  </SPillActions>
                </>
              )}
            </SCustomPill>
          </Flex>
        </Flex>

        {/* Price input row — flip pill, then price + denom + fiat (Figma). */}
        <Flex align="center" gap="s">
          <SFlipPill
            type="button"
            onClick={() => setIsInverted((prev) => !prev)}
            aria-label="Switch denomination"
          >
            <Icon
              component={ArrowLeftRight}
              size="s"
              color={getToken("icons.onContainer")}
            />
          </SFlipPill>
          <Flex
            direction="column"
            flex={1}
            minWidth={0}
            align="flex-end"
            sx={{ gap: "2px" }}
          >
            <Flex
              align="center"
              width="100%"
              gap="xs"
              minWidth={0}
              justify="flex-end"
            >
              <NumberInput
                variant="embedded"
                value={displayPrice}
                allowNegative={false}
                onValueChange={({ value }, { source }) => {
                  if (source === "prop") return
                  handlePriceChange(value)
                }}
                placeholder="0"
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: 1,
                  color: getToken("text.high"),
                  flex: 1,
                  minWidth: 0,
                  textAlign: "right",
                }}
              />
              <Text
                fw={600}
                fs="p3"
                lh="s"
                color={getToken("text.medium")}
                whiteSpace="nowrap"
                sx={{ flexShrink: 0 }}
              >
                {denominationSuffix}
              </Text>
            </Flex>
            {showPriceFiatRow && (
              <Text
                fs="p6"
                lh="s"
                fw={400}
                color={getToken("text.low")}
                truncate
                sx={{
                  maxWidth: "100%",
                  textAlign: "right",
                  /* Embedded row is ~2.5rem tall; pull fiat up so it sits ~2px under the figures. */
                  marginTop: pxToRem(-14),
                }}
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

        {/* Spot reset — extra top margin vs fiat so it’s clearly separated from the $ line */}
        {spotDisplayValue && (
          <Flex justify="flex-end" mt="m">
            <SSpotButton type="button" onClick={handleSetSpotPrice}>
              <Trans
                i18nKey="trade:limit.spot"
                values={{ value: spotDisplayValue }}
                components={{ spotPrice: <SSpotPrice /> }}
              />
            </SSpotButton>
          </Flex>
        )}
      </Flex>

      <SwapSectionSeparator />

      {/* Expiry selector */}
      <Flex justify="space-between" align="center" py="base">
        <Text fw={500} fs="p5" lh="s" color={getToken("text.medium")}>
          {t("trade:limit.expiry")}
        </Text>
        <Flex gap="xs">
          {EXPIRY_OPTIONS.map((option) => (
            <SExpiryPill
              key={option}
              type="button"
              onClick={() => setValue("expiry", option)}
              isActive={expiry === option}
            >
              {t(`trade:limit.expiry.${option}`)}
            </SExpiryPill>
          ))}
        </Flex>
      </Flex>

      <SwapSectionSeparator />

      {/* Partially fillable toggle */}
      <Flex justify="space-between" align="center" py="base">
        <Tooltip
          side="top"
          asChild
          text={
            <Flex direction="column" gap="s">
              <Text fs="p5" lh="m">
                <Trans
                  i18nKey="trade:limit.partiallyFillable.tooltip.intro"
                  components={[<SEmphasis key="em" />]}
                />
              </Text>
              <SBulletList>
                <li>
                  <Trans
                    i18nKey="trade:limit.partiallyFillable.tooltip.partial"
                    components={[<SEmphasis key="em" />]}
                  />
                </li>
                <li>
                  <Trans
                    i18nKey="trade:limit.partiallyFillable.tooltip.fillOrKill"
                    components={[<SEmphasis key="em" />]}
                  />
                </li>
              </SBulletList>
            </Flex>
          }
        >
          <Text fw={500} fs="p5" lh="s" color={getToken("text.medium")}>
            {t("trade:limit.partiallyFillable")}
          </Text>
        </Tooltip>
        <Flex align="center" gap="s">
          <Text fw={500} fs="p5" lh="s" color={getToken("text.low")}>
            {t("trade:limit.partiallyFillable.enabled")}
          </Text>
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

// ── Styled components ──

const SFlipPill = styled.button(
  ({ theme }) => css`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.space.xs};
    padding: ${theme.space.base};
    border-radius: 30px;
    border: 1px solid ${theme.buttons.secondary.low.borderRest};
    background: ${theme.buttons.secondary.low.rest};
    transition: ${theme.transitions.colors};

    &:hover {
      background: ${theme.buttons.secondary.low.hover};
    }
  `,
)

type PillTone = "neutral" | "positive" | "negative"

const SCustomPill = styled.div<{ isActive?: boolean; tone?: PillTone }>(
  ({ theme, isActive, tone = "neutral" }) => {
    const idleNeutral = css`
      color: ${theme.text.low};
      background: ${theme.buttons.secondary.low.rest};
      border: 1px solid ${theme.buttons.secondary.low.borderRest};

      &:hover {
        background: ${theme.buttons.secondary.low.hover};
      }
    `

    const activeNeutral = css`
      cursor: default;
      color: ${theme.buttons.secondary.accent.onRest};
      background: ${theme.buttons.secondary.accent.rest};
      border: 1px solid ${theme.buttons.secondary.accent.outline};

      &:hover {
        background: ${theme.buttons.secondary.accent.hover};
      }
    `

    const activeToned = css`
      cursor: default;

      &:hover {
        filter: brightness(1.03);
      }
    `

    const idleByTone =
      tone === "positive"
        ? css`
            color: ${theme.accents.success.emphasis};
            background: ${theme.accents.success.dim};
            border: 1px solid ${theme.accents.success.primary};

            &:hover {
              filter: brightness(1.04);
            }
          `
        : tone === "negative"
          ? css`
              color: ${theme.accents.danger.secondary};
              background: ${theme.accents.danger.dimBg};
              border: 1px solid ${theme.accents.danger.secondary};

              &:hover {
                filter: brightness(1.04);
              }
            `
          : idleNeutral

    const activeByTone =
      tone === "positive"
        ? css`
            ${activeToned}
            color: ${theme.accents.success.emphasis};
            background: ${theme.accents.success.dim};
            border: 1px solid ${theme.accents.success.primary};
          `
        : tone === "negative"
          ? css`
              ${activeToned}
              color: ${theme.accents.danger.secondary};
              background: ${theme.accents.danger.dimBg};
              border: 1px solid ${theme.accents.danger.emphasis};
            `
          : activeNeutral

    return css`
      box-sizing: border-box;
      display: inline-flex;
      align-items: stretch;
      gap: 0;
      /* Fixed 22px height: view ↔ edit stays aligned; px avoids rem/root drift (~24px). */
      height: 22px;
      padding: 0 ${theme.space.base};
      border-radius: ${theme.radii.full};
      font-size: ${theme.fontSizes.p6};
      font-weight: 500;
      line-height: 1;
      transition:
        ${theme.transitions.colors},
        filter 0.15s ease;

      ${isActive ? activeByTone : idleByTone}
    `
  },
)

const SPillActions = styled.div(
  ({ theme }) => css`
    display: inline-flex;
    align-items: stretch;
    flex-shrink: 0;
    align-self: stretch;
    margin-inline-start: ${theme.space.s};
    min-width: calc(
      ${theme.space.s} + 1px + ${pxToRem(SPILL_SLICE_BUTTON_WIDTH_PX)}
    );
    margin-inline-end: calc(-1 * ${theme.space.base});
  `,
)

const SPillTrigger = styled.button(
  ({ theme }) => css`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    align-self: center;
    min-width: 0;
    color: inherit;
    font: inherit;
    line-height: inherit;

    &:focus-visible {
      border-radius: ${theme.radii.full};
      outline: 2px solid ${theme.controls.outline.active};
      outline-offset: 1px;
    }
  `,
)

const SPercentSuffix = styled.span(
  ({ theme }) => css`
    align-self: center;
    margin-left: ${theme.space.xs};
  `,
)

const SPillSeparator = styled.span(
  ({ theme }) => css`
    flex-shrink: 0;
    align-self: stretch;
    width: 1px;
    margin-inline-end: 0;
    margin-inline-start: ${theme.space.s};
    background: ${theme.controls.outline.base};
  `,
)

/** Edit / close: full-height slice to the pill’s right edge, solid hover fill. */
const SPillSliceButton = styled.button(
  ({ theme }) => css`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    flex: 0 0 ${pxToRem(SPILL_SLICE_BUTTON_WIDTH_PX)};
    align-items: center;
    align-self: stretch;
    justify-content: center;
    width: ${pxToRem(SPILL_SLICE_BUTTON_WIDTH_PX)};
    line-height: 0;
    padding: 0 ${theme.space.xs};
    border-radius: 0 ${theme.radii.full} ${theme.radii.full} 0;
    color: inherit;
    background: transparent;
    transition: ${theme.transitions.colors};

    &:hover {
      background: ${theme.controls.dim.hover};
    }

    &:focus-visible {
      outline: 2px solid ${theme.controls.outline.active};
      outline-offset: -1px;
    }
  `,
)

/**
 * Inline input embedded inside SCustomPill when editing. Styled to
 * blend into the pill: no border, transparent background, inherits
 * font/color from the pill so the swap between view and edit mode is
 * visually stable.
 */
const SPillInlineInput = styled.input(
  ({ theme }) => css`
    all: unset;
    /* Size just wide enough for a typical deviation like "-12.34". */
    width: 4ch;
    align-self: center;
    height: 1em;
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    text-align: right;
    font: inherit;
    line-height: 1;
    color: inherit;

    &::placeholder {
      color: ${theme.text.low};
      opacity: 1;
    }

    /* Hide the placeholder the moment the input is focused — the user
       clicked to enter a value, not to read the old one. */
    &:focus::placeholder {
      color: transparent;
    }
  `,
)

const SSpotPrice = styled.span`
  text-decoration: underline dotted;
  text-underline-offset: 0.15em;
`

const SSpotButton = styled.button(
  ({ theme }) => css`
    all: unset;
    cursor: pointer;
    font-size: ${theme.fontSizes.p5};
    font-weight: 500;
    line-height: 1.2;
    color: ${theme.text.medium};
    transition: ${theme.transitions.colors};

    &:hover {
      color: ${theme.text.high};
    }
  `,
)

const SEmphasis = styled.em`
  font-style: italic;
  font-weight: 500;
`

const SBulletList = styled.ul`
  list-style-type: disc;
  padding-left: 16px;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;

  li + li {
    margin-top: 4px;
  }
`

const SExpiryPill = styled.button<{ isActive?: boolean }>(
  ({ theme, isActive }) => css`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    padding: 0 ${theme.space.base};
    border-radius: 20px;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.4;
    text-transform: uppercase;
    transition: all 0.15s ease;

    ${isActive
      ? css`
          color: ${theme.buttons.secondary.accent.onRest};
          background: ${theme.buttons.secondary.accent.hover};
          border: 1px solid ${theme.buttons.secondary.accent.outline};
        `
      : css`
          color: ${theme.text.high};
          background: ${theme.buttons.secondary.low.rest};
          border: 1px solid ${theme.buttons.secondary.low.borderRest};

          &:hover {
            background: ${theme.buttons.secondary.low.hover};
          }
        `}
  `,
)
