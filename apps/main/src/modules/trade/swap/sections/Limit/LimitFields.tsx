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

import { bestSellQuery } from "@/api/trade"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  computeDerived,
  FieldName,
  getDerived,
  lockSellIntoLastTwo,
  updateLastTwoOnTouch,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"
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

  // Market reference price — exactly the same router quote the Market
  // (swap) tab uses for "you get":
  //   - User typed sellAmount → execution rate = amountOut / amountIn.
  //     Fees + price impact at the user's size. `displayed_rate ×
  //     sellAmount` equals what the swap tab would show as "you get"
  //     for the same sell amount.
  //   - sellAmount empty → probe the router with 1 whole unit. At that
  //     tiny size impact is negligible, so the resulting rate is
  //     effectively fee-adjusted spot (≈ spot × (1 − tradeFeePct)).
  //     This gives the user a stable "top of book with fees" reference
  //     before they commit to an amount; transitioning to execution
  //     rate as they type reveals only the impact component.
  // User slippage buffer is never included anywhere in the limit
  // flow — limit orders submit `amount_out` exactly as displayed.
  const sellAmountForQuote =
    sellAmount && Big(sellAmount || "0").gt(0) ? sellAmount : "1"

  const { data: swap } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmountForQuote,
    }),
  )

  const marketPrice = (() => {
    if (!swap || !sellAsset || !buyAsset) return null
    try {
      const inHuman = Big(swap.amountIn.toString()).div(
        Big(10).pow(sellAsset.decimals),
      )
      const outHuman = Big(swap.amountOut.toString()).div(
        Big(10).pow(buyAsset.decimals),
      )
      if (inHuman.lte(0) || outHuman.lte(0)) return null
      return formatCalcValue(outHuman.div(inHuman))
    } catch {
      return null
    }
  })()

  // ── Cascade plumbing ──────────────────────────────────────────────
  // The cascade rule lives in cascadeLogic.ts. This file just wires it
  // into the form: every user touch updates `lastTwo`, then we
  // recompute the derived field from the kept pair.

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounced = useCallback((fn: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fn, RECALCULATE_DEBOUNCE_MS)
  }, [])

  /**
   * After a touch, recompute the derived field's value from the kept
   * pair. Honours `priceAnchor` when price is part of the kept pair:
   *   - priceAnchor === "market" + price kept → use live `marketPrice`
   *     for the kept "price" value (caller should also write that
   *     back into the limitPrice field via the market-mirror effect).
   *   - priceAnchor === "user" + price kept → use whatever's currently
   *     in form.limitPrice.
   */
  const recomputeDerivedField = useCallback(() => {
    const values = getValues()
    const derived = getDerived(values.lastTwo)
    const priceForCompute =
      values.priceAnchor === "market" && values.lastTwo.includes("price")
        ? (marketPrice ?? values.limitPrice ?? "")
        : (values.limitPrice ?? "")
    const computed = computeDerived(derived, {
      sell: values.sellAmount ?? "",
      buy: values.buyAmount ?? "",
      price: priceForCompute,
    })
    if (derived === "buy") {
      setValue("buyAmount", computed ?? "")
    } else if (derived === "sell") {
      setValue("sellAmount", computed ?? "")
    } else {
      setValue("limitPrice", computed ?? "")
    }
  }, [getValues, setValue, marketPrice])

  /**
   * Generic touch handler — used by sell/buy amount changes here, and
   * exposed via callbacks for the price input + pill in
   * LimitPriceSection. Updates `lastTwo`, then debounces a derived
   * recompute so we don't thrash on every keystroke.
   */
  const onFieldTouch = useCallback(
    (field: FieldName) => {
      const values = getValues()
      const next = updateLastTwoOnTouch(values.lastTwo, field, values.isLocked)
      if (next !== values.lastTwo) setValue("lastTwo", next)
      debounced(() => {
        recomputeDerivedField()
        trigger()
      })
    },
    [debounced, getValues, recomputeDerivedField, setValue, trigger],
  )

  const handleSellAmountChange = useCallback(
    (_newSellAmount: string) => onFieldTouch("sell"),
    [onFieldTouch],
  )
  const handleBuyAmountChange = useCallback(
    (_newBuyAmount: string) => onFieldTouch("buy"),
    [onFieldTouch],
  )

  // ── Market-price mirror ───────────────────────────────────────────
  // When `price` is in the kept pair AND priceAnchor === "market", we
  // sync `limitPrice` to the latest `marketPrice` (which refetches
  // every block) and recompute the derived field. When price is the
  // derived field, this effect is a no-op — the cascade already sets
  // limitPrice from the two kept amounts.
  useEffect(() => {
    if (!marketPrice) return
    const values = getValues()
    if (values.priceAnchor !== "market") return
    if (!values.lastTwo.includes("price")) return
    if (values.limitPrice === marketPrice) return

    setValue("limitPrice", marketPrice)

    const derived = getDerived(values.lastTwo)
    if (derived === "price") return

    const computed = computeDerived(derived, {
      sell: values.sellAmount ?? "",
      buy: values.buyAmount ?? "",
      price: marketPrice,
    })
    // null = inputs missing → leave the derived field as-is rather
    // than auto-filling something the user hasn't asked for.
    if (computed === null) return
    if (derived === "buy") setValue("buyAmount", computed)
    else if (derived === "sell") setValue("sellAmount", computed)
  }, [marketPrice, getValues, setValue])

  // ── Lock toggle ──
  const handleLockToggle = useCallback(() => {
    const values = getValues()
    const nextLocked = !values.isLocked
    setValue("isLocked", nextLocked)
    if (nextLocked) {
      // Force sell into the kept pair if it isn't already, so the
      // first buy/price edit derives the third (non-sell) field.
      const next = lockSellIntoLastTwo(values.lastTwo)
      if (next !== values.lastTwo) setValue("lastTwo", next)
      // If the act of locking displaced a kept field into derived,
      // recompute it.
      debounced(() => {
        recomputeDerivedField()
        trigger()
      })
    }
  }, [getValues, setValue, debounced, recomputeDerivedField, trigger])

  // ── Asset change handlers ──

  const handleSellAssetChange = useCallback(
    (newSellAsset: TAsset) => {
      const values = getValues()
      reset({
        ...values,
        sellAsset: newSellAsset,
        limitPrice: "",
        buyAmount: "",
        // Reset to "price kept, sell will fill on first sell touch".
        lastTwo: ["price", "sell"],
        priceAnchor: "market",
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
        lastTwo: ["price", "sell"],
        priceAnchor: "market",
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
