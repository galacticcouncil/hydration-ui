import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Pencil } from "lucide-react"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import {
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
} from "@/modules/trade/swap/sections/Limit/LimitPriceSection.styled"
import { formatCalcValue } from "@/modules/trade/swap/sections/Limit/limitUtils"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  /** Reference price in SELL-per-BUY units (spot), or null while loading. */
  readonly marketSellPerBuy: string | null
}

/**
 * Optional price condition for a TWAP order ("limit TWAP"). Stored in the
 * form as `limitPrice` in SELL-per-BUY units — the same units shown in the
 * "When 1 {BUY} price is below {P} {SELL}" label — so the per-slice floor is
 * simply `amount_in(SELL) / limitPrice`. When off, the order is a plain
 * market TWAP. Slippage is deliberately not applied (exact floor), matching
 * the Limit screen; a buffer can be added later.
 */
export const DcaLimitPrice: FC<Props> = ({ marketSellPerBuy }) => {
  const { t } = useTranslation(["trade", "common"])
  const { watch, setValue } = useFormContext<DcaFormValues>()

  const [limitEnabled, limitPrice, sellAsset, buyAsset, isInverted] = watch([
    "limitEnabled",
    "limitPrice",
    "sellAsset",
    "buyAsset",
    "limitInverted",
  ])

  // Prefill with spot the first time it's enabled so the field isn't empty.
  useEffect(() => {
    if (limitEnabled && !limitPrice && marketSellPerBuy) {
      setValue("limitPrice", marketSellPerBuy, { shouldValidate: true })
    }
  }, [limitEnabled, limitPrice, marketSellPerBuy, setValue])

  // Reset the price when the pair changes — a price for HDX/USDC is
  // meaningless for another pair.
  useEffect(() => {
    setValue("limitPrice", "")
    setUserPct(null)
  }, [sellAsset?.id, buyAsset?.id, setValue])

  // Inline ±% pill: user types a deviation from spot; we store the raw pct so
  // the pill shows exactly what they typed (avoids rounding drift), and set
  // limitPrice = spot × (1 + pct/100). Cleared when the price is set another way.
  const [userPct, setUserPct] = useState<number | null>(null)
  const [isEditingPill, setIsEditingPill] = useState(false)
  const pillInputRef = useRef<HTMLInputElement>(null)

  const applyPill = useCallback(
    (raw: string) => {
      if (!marketSellPerBuy) return
      const trimmed = raw.trim()
      if (!trimmed) {
        setUserPct(null)
        setValue("limitPrice", marketSellPerBuy, { shouldValidate: true })
        return
      }
      try {
        const pct = new Big(trimmed)
        if (pct.lte(-100)) return
        const next = new Big(marketSellPerBuy).times(Big(1).plus(pct.div(100)))
        if (next.lte(0)) return
        setUserPct(pct.toNumber())
        setValue("limitPrice", formatCalcValue(next), { shouldValidate: true })
      } catch {
        /* partial input like "-" or "5." — ignore until valid */
      }
    },
    [marketSellPerBuy, setValue],
  )

  // Denomination toggle: false = "1 BUY = X SELL" (default, matches the label),
  // true = "1 SELL = X BUY". Display-only — the canonical `limitPrice`
  // (SELL-per-BUY) is unchanged; only how it's shown/typed flips.
  const setIsInverted = (next: boolean) =>
    setValue("limitInverted", next, { shouldValidate: false })
  // Preserve the user's raw keystrokes so the input doesn't reformat mid-type
  // (mirrors LimitPriceSection). Valid only while the canonical it produced and
  // the inversion still match.
  const userInputRef = useRef<{
    value: string
    inverted: boolean
    canonical: string
  } | null>(null)

  const displayPrice = (() => {
    const u = userInputRef.current
    if (u && u.inverted === isInverted && u.canonical === limitPrice)
      return u.value
    if (!limitPrice) return ""
    try {
      const v = isInverted
        ? Big(1).div(new Big(limitPrice))
        : new Big(limitPrice)
      return v.lte(0) ? "" : formatCalcValue(v)
    } catch {
      return ""
    }
  })()

  const handlePriceChange = useCallback(
    (displayValue: string) => {
      let canonical: string
      if (!isInverted) {
        canonical = displayValue
      } else {
        try {
          const p = new Big(displayValue)
          if (p.lte(0)) return
          canonical = Big(1).div(p).toString()
        } catch {
          return
        }
      }
      userInputRef.current = {
        value: displayValue,
        inverted: isInverted,
        canonical,
      }
      setUserPct(null)
      setValue("limitPrice", canonical, { shouldValidate: true })
    },
    [isInverted, setValue],
  )

  // The asset the price is quoted in, given the denomination.
  const priceQuoteSymbol =
    (isInverted ? buyAsset?.symbol : sellAsset?.symbol) ?? ""
  const priceBaseSymbol =
    (isInverted ? sellAsset?.symbol : buyAsset?.symbol) ?? ""
  const priceQuoteAssetId = (isInverted ? buyAsset?.id : sellAsset?.id) ?? ""

  const [priceFiat] = useDisplayAssetPrice(
    priceQuoteAssetId,
    displayPrice || "0",
    { compact: true, maximumFractionDigits: 2 },
  )

  const deviationDisplay = (() => {
    if (userPct !== null) {
      const sign = userPct > 0 ? "+" : ""
      return `${sign}${userPct.toFixed(2)}%`
    }
    if (!limitPrice || !marketSellPerBuy) return "0%"
    try {
      const dev = new Big(limitPrice)
        .minus(marketSellPerBuy)
        .div(marketSellPerBuy)
        .times(100)
        .toNumber()
      const sign = dev > 0 ? "+" : ""
      return `${sign}${dev.toFixed(2)}%`
    } catch {
      return "0%"
    }
  })()

  return (
    <Flex direction="column">
      <SwapSectionSeparator />
      <Flex justify="space-between" align="center" py="m">
        <Text fw={500} fs="p5" color={getToken("text.medium")}>
          {t("trade:dca.limit.title")}
        </Text>
        <ToggleRoot>
          <Toggle
            name="limitEnabled"
            checked={limitEnabled}
            onCheckedChange={(checked) => setValue("limitEnabled", !!checked)}
          />
          <ToggleLabel>
            {t(
              limitEnabled
                ? "trade:dca.limit.enabled"
                : "trade:dca.limit.disabled",
            )}
          </ToggleLabel>
        </ToggleRoot>
      </Flex>

      {limitEnabled && (
        <>
          <SwapSectionSeparator />
          <Flex direction="column" gap="xs" sx={{ paddingBlock: "16px" }}>
            <Flex justify="space-between" align="center">
              <Text fw={500} fs="p5" lh="s" color={getToken("text.medium")}>
                {t(
                  isInverted
                    ? "trade:dca.limit.priceLabelAbove"
                    : "trade:dca.limit.priceLabel",
                  { symbol: priceBaseSymbol },
                )}
              </Text>
              <SCustomPill
                isActive={isEditingPill}
                tone={
                  userPct && userPct > 0
                    ? "positive"
                    : userPct && userPct < 0
                      ? "negative"
                      : "neutral"
                }
              >
                {isEditingPill ? (
                  <>
                    <SPillInlineInput
                      getInputRef={pillInputRef}
                      defaultValue={userPct !== null ? String(userPct) : ""}
                      placeholder={deviationDisplay.replace("%", "")}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => {
                        setIsEditingPill(false)
                        applyPill(e.target.value)
                      }}
                      onValueChange={({ value }) => applyPill(value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applyPill((e.target as HTMLInputElement).value)
                          setIsEditingPill(false)
                        }
                        if (e.key === "Escape") setIsEditingPill(false)
                      }}
                    />
                    <SPercentSuffix>%</SPercentSuffix>
                  </>
                ) : (
                  <>
                    <SPillTrigger
                      type="button"
                      onClick={() => {
                        setIsEditingPill(true)
                        setTimeout(() => pillInputRef.current?.focus(), 0)
                      }}
                    >
                      {deviationDisplay}
                    </SPillTrigger>
                    <SPillActions>
                      <SPillSeparator aria-hidden />
                      <SPillSliceButton
                        type="button"
                        onClick={() => {
                          setIsEditingPill(true)
                          setTimeout(() => pillInputRef.current?.focus(), 0)
                        }}
                        aria-label={t("trade:dca.limit.editDeviation")}
                      >
                        <Pencil />
                      </SPillSliceButton>
                    </SPillActions>
                  </>
                )}
              </SCustomPill>
            </Flex>

            <Flex align="center" width="100%" gap="s">
              <Button
                variant="tertiary"
                size="medium"
                outline
                onClick={() => setIsInverted(!isInverted)}
                aria-label={t("trade:dca.limit.invert")}
              >
                <Icon
                  component={ArrowLeftRight}
                  size="m"
                  color={getToken("icons.onContainer")}
                />
              </Button>
              <Flex
                align="center"
                flex={1}
                minWidth={0}
                gap="s"
                justify="flex-end"
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
                  color={getToken("text.medium")}
                  whiteSpace="nowrap"
                >
                  {priceQuoteSymbol}
                </Text>
              </Flex>
            </Flex>
            {limitPrice && (
              <Text
                fs="p6"
                lh={1}
                fw={400}
                color={getToken("text.low")}
                truncate
                sx={{ alignSelf: "flex-end" }}
              >
                {priceFiat}
              </Text>
            )}

            {marketSellPerBuy && (
              <Flex justify="flex-end" mt="m">
                <SMarketButton
                  type="button"
                  onClick={() => {
                    setUserPct(null)
                    userInputRef.current = null
                    setValue("limitPrice", marketSellPerBuy, {
                      shouldValidate: true,
                    })
                  }}
                >
                  {t("trade:dca.limit.spot")}{" "}
                  <SMarketPrice>
                    {formatCalcValue(
                      isInverted
                        ? Big(1).div(new Big(marketSellPerBuy))
                        : new Big(marketSellPerBuy),
                    )}
                  </SMarketPrice>
                </SMarketButton>
              </Flex>
            )}
          </Flex>
        </>
      )}
    </Flex>
  )
}
