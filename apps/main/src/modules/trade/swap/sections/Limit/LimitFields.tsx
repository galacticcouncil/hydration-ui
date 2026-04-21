import styled from "@emotion/styled"
import { Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { LockKeyhole, LockKeyholeOpen } from "lucide-react"
import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { LimitPriceSection } from "@/modules/trade/swap/sections/Limit/LimitPriceSection"
import { LimitSwitcher } from "@/modules/trade/swap/sections/Limit/LimitSwitcher"
import { formatCalcValue } from "@/modules/trade/swap/sections/Limit/limitUtils"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { TAsset, useAssets } from "@/providers/assetsProvider"
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

  // ── Lock icon positioning: measure asset button and place lock after it ──
  const sellFieldRef = useRef<HTMLDivElement>(null)
  const [lockPos, setLockPos] = useState<
    { left: number; top: number } | undefined
  >(undefined)

  useLayoutEffect(() => {
    const container = sellFieldRef.current
    if (!container) return
    // Find the asset selector pill button inside the sell field
    const assetBtn = container.querySelector<HTMLElement>(
      'button[type="button"]:not([aria-label])',
    )
    if (!assetBtn) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = assetBtn.getBoundingClientRect()
    setLockPos({
      left: btnRect.right - containerRect.left + 4,
      top: btnRect.top - containerRect.top,
    })
  }, [sellAsset])

  const buyableAssets = tradable.filter(
    (asset) => !SELL_ONLY_ASSETS.includes(asset.id),
  )

  // Use spotPriceQuery — same clean theoretical rate as the swap page
  // (TradeAssetSwitcher fallback). No fees or price impact.
  const { data: spotData } = useQuery(
    spotPriceQuery(rpc, sellAsset?.id ?? "", buyAsset?.id ?? ""),
  )

  const marketPrice = (() => {
    if (!spotData?.spotPrice) return null
    try {
      const spot = new Big(spotData.spotPrice)
      if (spot.lte(0)) return null
      return formatCalcValue(spot)
    } catch {
      return null
    }
  })()

  // ── Recalculation helpers ──

  /** Given sell + price → buy */
  const calcBuyFromSellAndPrice = useCallback(
    (sell: string, price: string): string => {
      try {
        if (!sell || !price) return ""
        return formatCalcValue(new Big(sell).times(price))
      } catch {
        return ""
      }
    },
    [],
  )

  /** Given buy + price → sell */
  const calcSellFromBuyAndPrice = useCallback(
    (buy: string, price: string): string => {
      try {
        if (!buy || !price) return ""
        const p = new Big(price)
        if (p.lte(0)) return ""
        return formatCalcValue(new Big(buy).div(p))
      } catch {
        return ""
      }
    },
    [],
  )

  /** Given sell + buy → price */
  const calcPriceFromAmounts = useCallback(
    (sell: string, buy: string): string => {
      try {
        if (!sell || !buy) return ""
        const s = new Big(sell)
        if (s.lte(0)) return ""
        return formatCalcValue(new Big(buy).div(s))
      } catch {
        return ""
      }
    },
    [],
  )

  // ── Keep limit price mirrored to spot until the user touches it ──
  // As long as `priceAnchor === "spot"` we re-sync `limitPrice` to the
  // latest `marketPrice` every time the spot query refetches (which it
  // does on every new block via QUERY_KEY_BLOCK_PREFIX). Once the user
  // types a custom price or % deviation, LimitPriceSection flips
  // `priceAnchor` to "user" and this effect becomes a no-op — their
  // typed value is preserved.
  useEffect(() => {
    if (!marketPrice) return
    const values = getValues()
    if (values.priceAnchor !== "spot") return
    if (values.limitPrice === marketPrice) return

    setValue("limitPrice", marketPrice)
    if (values.sellAmount) {
      setValue(
        "buyAmount",
        calcBuyFromSellAndPrice(values.sellAmount, marketPrice),
      )
    }
  }, [marketPrice, getValues, setValue, calcBuyFromSellAndPrice])

  // ── Field change handlers (Matcha anchor model) ──

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debounced = useCallback((fn: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fn, RECALCULATE_DEBOUNCE_MS)
  }, [])

  /** User edits sell amount */
  const handleSellAmountChange = useCallback(
    (newSellAmount: string) => {
      // Record anchor synchronously so a subsequent price edit
      // (which is not debounced) already sees the new anchor.
      setValue("amountAnchor", "sell")
      debounced(() => {
        const values = getValues()
        const price = values.limitPrice

        if (!price) return

        // Price-sacred (or locked): sell changed → recalc buy
        const newBuy = calcBuyFromSellAndPrice(newSellAmount, price)
        setValue("buyAmount", newBuy)
        trigger()
      })
    },
    [debounced, getValues, setValue, calcBuyFromSellAndPrice, trigger],
  )

  /** User edits buy amount */
  const handleBuyAmountChange = useCallback(
    (newBuyAmount: string) => {
      // When locked, sell is sacred → anchor stays "sell".
      // Otherwise the user is now anchoring on buy.
      const { isLocked } = getValues()
      if (!isLocked) setValue("amountAnchor", "buy")
      debounced(() => {
        const values = getValues()
        const price = values.limitPrice

        if (!values.isLocked) {
          // Price-sacred: buy changed → recalc sell
          if (price) {
            const newSell = calcSellFromBuyAndPrice(newBuyAmount, price)
            setValue("sellAmount", newSell)
          }
        } else {
          // Sell-sacred: sell locked → recalc price
          if (values.sellAmount) {
            const newPrice = calcPriceFromAmounts(
              values.sellAmount,
              newBuyAmount,
            )
            setValue("limitPrice", newPrice)
          }
        }
        trigger()
      })
    },
    [
      debounced,
      getValues,
      setValue,
      calcSellFromBuyAndPrice,
      calcPriceFromAmounts,
      trigger,
    ],
  )

  // ── Lock toggle ──
  const handleLockToggle = useCallback(() => {
    const values = getValues()
    const nextLocked = !values.isLocked
    setValue("isLocked", nextLocked)
    // Turning the lock ON forces sell-sacred mode, so the anchor
    // needs to match — otherwise a subsequent price edit would try
    // to honor a buy anchor that contradicts the lock.
    if (nextLocked) setValue("amountAnchor", "sell")
  }, [getValues, setValue])

  // ── Asset change handlers ──

  const handleSellAssetChange = useCallback(
    (newSellAsset: TAsset) => {
      const values = getValues()
      // Reset price — will be re-populated from marketPrice by the
      // spot-mirroring effect (priceAnchor stays "spot" after reset).
      reset({
        ...values,
        sellAsset: newSellAsset,
        limitPrice: "",
        buyAmount: "",
        amountAnchor: "sell",
        priceAnchor: "spot",
      })
      trigger()
    },
    [getValues, reset, trigger],
  )

  const handleBuyAssetChange = useCallback(
    (newBuyAsset: TAsset) => {
      const values = getValues()
      reset({
        ...values,
        buyAsset: newBuyAsset,
        limitPrice: "",
        buyAmount: "",
        amountAnchor: "sell",
        priceAnchor: "spot",
      })
      trigger()
    },
    [getValues, reset, trigger],
  )

  return (
    <div>
      {/* Sell field with lock icon next to asset button */}
      <SLockableField ref={sellFieldRef}>
        <AssetSelectFormField<LimitFormValues>
          assetFieldName="sellAsset"
          amountFieldName="sellAmount"
          label={t("sell")}
          assets={tradable}
          maxBalanceFallback="0"
          onAssetChange={(sellAsset, previousSellAsset) => {
            const { buyAsset } = getValues()
            if (sellAsset.id === buyAsset?.id) {
              setValue("sellAsset", previousSellAsset)
              return
            }
            handleSellAssetChange(sellAsset)
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
        {sellAmount && (
          <SLockPill
            type="button"
            onClick={handleLockToggle}
            aria-label={isLocked ? "Unlock sell amount" : "Lock sell amount"}
            isLocked={isLocked}
            style={
              lockPos ? { left: lockPos.left, top: lockPos.top } : undefined
            }
          >
            <Icon
              component={isLocked ? LockKeyhole : LockKeyholeOpen}
              sx={{ width: 14, height: 14 }}
              // When locked: blue accent; when unlocked: neutral.
              // Matches the active-expiry-pill treatment so the user
              // reads the lock as an "on/off" state rather than just
              // a decorative icon.
              color={getToken(
                isLocked
                  ? "buttons.secondary.accent.onRest"
                  : "icons.onContainer",
              )}
            />
          </SLockPill>
        )}
      </SLockableField>

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
          handleBuyAssetChange(buyAsset)
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

      <LimitPriceSection marketPrice={marketPrice} />
    </div>
  )
}

// ── Styled components ──

/** Wrapper that enables absolute positioning of the lock pill */
const SLockableField = styled.div`
  position: relative;
`

/**
 * Lock pill — styled exactly like input/assetSelector from the design:
 * same height (38px), border, border-radius (30px), and padding as the
 * asset selector buttons. Contains a centered 14px lock icon.
 * Position (left + top) is set dynamically via style prop.
 *
 * When `isLocked` is true the pill gets the blue accent treatment
 * (same tokens as the selected expiry pill) so it reads clearly as an
 * "on" state rather than a decorative icon.
 */
const SLockPill = styled.button<{ isLocked?: boolean }>(
  ({ theme, isLocked }) => `
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    position: absolute;

    display: flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    padding: ${theme.space.base} ${theme.space.m};
    border-radius: 30px;
    border: 1px solid ${
      isLocked
        ? theme.buttons.secondary.accent.outline
        : theme.buttons.secondary.low.borderRest
    };
    background: ${
      isLocked ? theme.buttons.secondary.accent.hover : "transparent"
    };
    transition: ${theme.transitions.colors};

    &:hover {
      border-color: ${
        isLocked
          ? theme.buttons.secondary.accent.outline
          : theme.buttons.secondary.low.hover
      };
      background: ${
        isLocked
          ? theme.buttons.secondary.accent.hover
          : theme.buttons.secondary.low.primaryHover
      };
    }
  `,
)
