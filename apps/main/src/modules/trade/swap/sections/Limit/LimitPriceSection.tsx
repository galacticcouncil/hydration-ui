import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Flex,
  Icon,
  NumberInput,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Pencil } from "lucide-react"
import { FC, useCallback, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { formatCalcValue } from "@/modules/trade/swap/sections/Limit/limitUtils"
import {
  EXPIRY_OPTIONS,
  LimitFormValues,
} from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly marketPrice: string | null
}

export const LimitPriceSection: FC<Props> = ({ marketPrice }) => {
  const { t } = useTranslation(["trade", "common"])
  const { watch, setValue, getValues, trigger } =
    useFormContext<LimitFormValues>()

  const [limitPrice, sellAsset, buyAsset, expiry, partiallyFillable] = watch([
    "limitPrice",
    "sellAsset",
    "buyAsset",
    "expiry",
    "partiallyFillable",
  ])

  // Denomination toggle: "normal" = 1 SELL = X BUY, "inverted" = 1 BUY = X SELL
  const [isInverted, setIsInverted] = useState(false)

  const displayPrice = (() => {
    if (!limitPrice) return ""
    if (!isInverted) return limitPrice
    try {
      const p = new Big(limitPrice)
      if (p.lte(0)) return ""
      return formatCalcValue(Big(1).div(p))
    } catch {
      return ""
    }
  })()

  const denominationSuffix = isInverted
    ? (sellAsset?.symbol ?? "")
    : (buyAsset?.symbol ?? "")

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

  // Recalculate buy from sell + price
  const recalcBuy = useCallback(
    (price: string) => {
      const values = getValues()
      if (values.sellAmount && price) {
        try {
          const raw = new Big(values.sellAmount).times(price)
          setValue("buyAmount", formatCalcValue(raw))
        } catch {
          // ignore
        }
      }
      trigger()
    },
    [getValues, setValue, trigger],
  )

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
          // Format to match our decimal convention; raw .toString() here
          // produces ~20 sig figs which leaks into the non-inverted view.
          newLimitPrice = formatCalcValue(Big(1).div(p))
        } catch {
          return
        }
      }

      setValue("limitPrice", newLimitPrice)
      // Both modes: price changed → recalc buy
      recalcBuy(newLimitPrice)
    },
    [isInverted, setValue, recalcBuy],
  )

  // ── Set limit price to spot/market price ──
  const handleSetSpotPrice = useCallback(() => {
    if (!marketPrice) return
    setValue("limitPrice", marketPrice)
    recalcBuy(marketPrice)
  }, [marketPrice, setValue, recalcBuy])

  // ── Inline editing mode for custom pill ──
  const [isEditingPill, setIsEditingPill] = useState(false)
  const pillInputRef = useRef<HTMLInputElement>(null)

  const handlePillEditStart = useCallback(() => {
    setIsEditingPill(true)
    setTimeout(() => pillInputRef.current?.focus(), 0)
  }, [])

  const handlePillEditCommit = useCallback(
    (value: string) => {
      setIsEditingPill(false)
      if (!marketPrice || !value) return
      try {
        const pct = new Big(value)
        const market = new Big(marketPrice)
        const newPrice = formatCalcValue(
          market.times(Big(1).plus(pct.div(100))),
        )
        setValue("limitPrice", newPrice)
        recalcBuy(newPrice)
      } catch {
        // ignore
      }
    },
    [marketPrice, setValue, recalcBuy],
  )

  // ── Deviation display for pill ──
  const deviationDisplay = (() => {
    if (deviation === null) return "0%"
    const sign = deviation > 0 ? "+" : ""
    return `${sign}${deviation.toFixed(2)}%`
  })()

  return (
    <Flex direction="column">
      {/* Price section */}
      <Flex direction="column" gap="xs" py="base">
        {/* Header: "When 1 HDX price is" (left) — "Spot: value" + custom pill + swap btn (right) */}
        <Flex justify="space-between" align="center">
          <Text fw={500} fs="p5" lh="s" color={getToken("text.medium")}>
            {t("trade:limit.priceLabel", {
              symbol: isInverted
                ? (buyAsset?.symbol ?? "")
                : (sellAsset?.symbol ?? ""),
            })}
          </Text>
          <Flex align="center" gap="s">
            {spotDisplayValue && (
              <SSpotButton type="button" onClick={handleSetSpotPrice}>
                {t("trade:limit.spot", { value: spotDisplayValue })}
              </SSpotButton>
            )}
            {/* Custom % pill showing deviation from market */}
            {isEditingPill ? (
              <SPillInput
                ref={pillInputRef}
                type="text"
                defaultValue={deviation?.toFixed(2) ?? "0"}
                onBlur={(e) => handlePillEditCommit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePillEditCommit((e.target as HTMLInputElement).value)
                  }
                  if (e.key === "Escape") {
                    setIsEditingPill(false)
                  }
                }}
              />
            ) : (
              <SCustomPill
                isPositive={deviation !== null && deviation > 0.005}
                isNegative={deviation !== null && deviation < -0.005}
              >
                {deviationDisplay}
                <SEditButton
                  type="button"
                  onClick={handlePillEditStart}
                  aria-label="Edit deviation"
                >
                  <Icon
                    component={Pencil}
                    size="2xs"
                    color={getToken("icons.onContainer")}
                  />
                </SEditButton>
              </SCustomPill>
            )}
            <ButtonIcon
              size="small"
              onClick={() => setIsInverted((prev) => !prev)}
              aria-label="Switch denomination"
            >
              <Icon
                component={ArrowLeftRight}
                size="xs"
                color={getToken("icons.onContainer")}
              />
            </ButtonIcon>
          </Flex>
        </Flex>

        {/* Price input */}
        <Flex align="center" gap="s">
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
              textAlign: "right",
            }}
          />
          <Text fw={600} fs="p3" lh="s" color={getToken("text.high")}>
            {denominationSuffix}
          </Text>
        </Flex>
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

const SCustomPill = styled.div<{
  isPositive?: boolean
  isNegative?: boolean
}>(
  ({ theme, isPositive, isNegative }) => css`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: ${theme.radii.base};
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    transition: all 0.15s ease;

    color: ${theme.text.high};
    ${isPositive
      ? css`
          background: linear-gradient(
            135deg,
            ${theme.accents.success.emphasis},
            ${theme.accents.success.primary}
          );
        `
      : isNegative
        ? css`
            background: linear-gradient(
              135deg,
              ${theme.accents.danger.emphasis},
              ${theme.accents.danger.secondary}
            );
          `
        : css`
            color: ${theme.text.low};
            background: ${theme.buttons.secondary.low.rest};
          `}
  `,
)

const SSpotButton = styled.button(
  ({ theme }) => css`
    all: unset;
    cursor: pointer;
    font-size: ${theme.fontSizes.p5};
    font-weight: 500;
    line-height: 1.2;
    color: ${theme.textButtons.small.rest};
    transition: ${theme.transitions.colors};

    &:hover {
      color: ${theme.textButtons.small.hover};
    }
  `,
)

const SEditButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`

const SPillInput = styled.input(
  ({ theme }) => css`
    all: unset;
    width: 60px;
    padding: 4px 8px;
    border-radius: ${theme.radii.base};
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    background: ${theme.buttons.secondary.low.rest};
    color: ${theme.text.high};
    text-align: center;

    &:focus {
      outline: 1px solid ${theme.controls.solid.accent};
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
