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

  // ── Initialize limit price from spot price on first load ──
  const priceInitialized = useRef(false)

  useEffect(() => {
    if (priceInitialized.current) return
    if (!marketPrice) return
    priceInitialized.current = true

    const values = getValues()
    if (!values.limitPrice) {
      setValue("limitPrice", marketPrice)
      if (values.sellAmount) {
        setValue(
          "buyAmount",
          calcBuyFromSellAndPrice(values.sellAmount, marketPrice),
        )
      }
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
      debounced(() => {
        const values = getValues()
        const price = values.limitPrice

        if (!price) return

        if (!values.isLocked) {
          // Price-sacred: sell changed → recalc buy
          const newBuy = calcBuyFromSellAndPrice(newSellAmount, price)
          setValue("buyAmount", newBuy)
        } else {
          // Sell-sacred: sell is locked, shouldn't normally be editable
          // but if it is, recalc buy
          const newBuy = calcBuyFromSellAndPrice(newSellAmount, price)
          setValue("buyAmount", newBuy)
        }
        trigger()
      })
    },
    [debounced, getValues, setValue, calcBuyFromSellAndPrice, trigger],
  )

  /** User edits buy amount */
  const handleBuyAmountChange = useCallback(
    (newBuyAmount: string) => {
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
    setValue("isLocked", !values.isLocked)
  }, [getValues, setValue])

  // ── Asset change handlers ──

  const handleSellAssetChange = useCallback(
    (newSellAsset: TAsset) => {
      const values = getValues()
      // Reset price, will be re-initialized from marketPrice
      priceInitialized.current = false
      reset({
        ...values,
        sellAsset: newSellAsset,
        limitPrice: "",
        buyAmount: "",
      })
      trigger()
    },
    [getValues, reset, trigger],
  )

  const handleBuyAssetChange = useCallback(
    (newBuyAsset: TAsset) => {
      const values = getValues()
      priceInitialized.current = false
      reset({
        ...values,
        buyAsset: newBuyAsset,
        limitPrice: "",
        buyAmount: "",
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
            style={
              lockPos ? { left: lockPos.left, top: lockPos.top } : undefined
            }
          >
            <Icon
              component={isLocked ? LockKeyhole : LockKeyholeOpen}
              sx={{ width: 14, height: 14 }}
              color={getToken("icons.onContainer")}
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
 */
const SLockPill = styled.button(
  ({ theme }) => `
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
    border: 1px solid ${theme.buttons.secondary.low.borderRest};
    transition: ${theme.transitions.colors};

    &:hover {
      border-color: ${theme.buttons.secondary.low.hover};
      background: ${theme.buttons.secondary.low.primaryHover};
    }
  `,
)
