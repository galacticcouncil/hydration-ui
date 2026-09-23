import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback, useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"

import { bestBuyQuery, bestSellQuery } from "@/api/trade"
import {
  marketPriceFromQuote,
  PriceSource,
} from "@/modules/trade/swap/lib/quotedPrice"
import {
  QuotedPriceBinding,
  useQuotedPrice,
} from "@/modules/trade/swap/lib/quotedPrice.hook"
import {
  computeDerived,
  FieldName,
  FieldValues,
  getDerived,
  getMarketQuoteDirection,
  lockSellIntoLastTwo,
  repairLastTwo,
  updateLastTwoOnTouch,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useRpcProvider } from "@/providers/rpcProvider"

const RECALCULATE_DEBOUNCE_MS = 250

const SILENT_SET = { shouldValidate: false, shouldTouch: false } as const

const positiveAmountOrOne = (amount: string | undefined): string => {
  try {
    return amount && Big(amount).gt(0) ? amount : "1"
  } catch {
    return "1"
  }
}

const cascadeFieldName = (
  field: FieldName,
): "sellAmount" | "buyAmount" | "limitPrice" => {
  switch (field) {
    case "sell":
      return "sellAmount"
    case "buy":
      return "buyAmount"
    case "price":
      return "limitPrice"
  }
}

const readFieldValues = (values: LimitFormValues): FieldValues => ({
  sell: values.sellAmount ?? "",
  buy: values.buyAmount ?? "",
  price: values.limitPrice ?? "",
})

type LimitCascade = {
  readonly quotedPrice: QuotedPriceBinding
  readonly isMarketLoading: boolean
  readonly isRecalculating: boolean
  readonly onSellAmountChange: () => void
  readonly onBuyAmountChange: () => void
  readonly onLockToggle: () => void
  readonly onAssetChange: (next: Partial<LimitFormValues>) => void
}

export const useLimitCascade = (): LimitCascade => {
  const rpc = useRpcProvider()
  const { reset, getValues, setValue, clearErrors, trigger, watch } =
    useFormContext<LimitFormValues>()

  const [sellAsset, buyAsset, sellAmount, buyAmount, lastTwo] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "buyAmount",
    "lastTwo",
  ])

  const marketQuoteDirection = getMarketQuoteDirection(lastTwo)
  const marketQuery =
    marketQuoteDirection === "buy"
      ? bestBuyQuery(rpc, {
          assetIn: sellAsset?.id ?? "",
          assetOut: buyAsset?.id ?? "",
          amountOut: positiveAmountOrOne(buyAmount),
        })
      : bestSellQuery(rpc, {
          assetIn: sellAsset?.id ?? "",
          assetOut: buyAsset?.id ?? "",
          amountIn: positiveAmountOrOne(sellAmount),
        })

  const {
    data: swap,
    isFetching: isSwapFetching,
    isPending: isSwapPending,
  } = useQuery({
    ...marketQuery,
    placeholderData: (previousData, previousQuery) => {
      if (!previousData || !previousQuery) return undefined
      const [, , prevDirection, prevIn, prevOut] = previousQuery.queryKey
      const direction = marketQuoteDirection === "buy" ? "bestBuy" : "bestSell"
      if (
        prevDirection === direction &&
        prevIn === (sellAsset?.id ?? "") &&
        prevOut === (buyAsset?.id ?? "")
      ) {
        return previousData
      }
      return undefined
    },
  })

  const marketPrice = marketPriceFromQuote(
    swap,
    sellAsset?.decimals,
    buyAsset?.decimals,
  )
  const isMarketLoading = isSwapPending || (isSwapFetching && !marketPrice)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const debounced = useCallback((fn: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsRecalculating(true)
    debounceRef.current = setTimeout(() => {
      fn()
      setIsRecalculating(false)
    }, RECALCULATE_DEBOUNCE_MS)
  }, [])

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    [],
  )

  const setDerivedField = useCallback(
    (field: FieldName, value: string | null) => {
      const name = cascadeFieldName(field)
      setValue(name, value ?? "", SILENT_SET)
      clearErrors(name)
    },
    [clearErrors, setValue],
  )

  const applyPriceTouch = useCallback(
    (newLimitPrice: string) => {
      const values = getValues()
      const lastTwo = updateLastTwoOnTouch(
        values.lastTwo,
        "price",
        values.isLocked,
      )
      if (lastTwo !== values.lastTwo) setValue("lastTwo", lastTwo, SILENT_SET)
      setValue("limitPrice", newLimitPrice)

      const derived = getDerived(lastTwo)
      if (derived !== "price") {
        const computed = computeDerived(derived, {
          ...readFieldValues(values),
          price: newLimitPrice,
        })
        setDerivedField(derived, computed)
      }
      trigger("limitPrice")
    },
    [getValues, setDerivedField, setValue, trigger],
  )

  const applyMarketPrice = useCallback(
    (newLimitPrice: string) => {
      const values = getValues()
      if (values.limitPrice === newLimitPrice) return

      const lastTwo = values.lastTwo.includes("price")
        ? values.lastTwo
        : updateLastTwoOnTouch(values.lastTwo, "price", values.isLocked)
      if (lastTwo !== values.lastTwo) setValue("lastTwo", lastTwo, SILENT_SET)

      setValue("limitPrice", newLimitPrice, SILENT_SET)

      const derived = getDerived(lastTwo)
      if (derived === "price") return

      const computed = computeDerived(derived, {
        ...readFieldValues(values),
        price: newLimitPrice,
      })
      if (computed === null) return
      setDerivedField(derived, computed)
    },
    [getValues, setDerivedField, setValue],
  )

  const quotedPrice = useQuotedPrice({
    marketPrice,
    pair: [sellAsset?.id ?? "", buyAsset?.id ?? ""],
    defaultInverted: false,
    onCanonicalChange: (canonical: string, source: PriceSource) => {
      if (source === "derived") return
      if (source === "user") applyPriceTouch(canonical)
      else applyMarketPrice(canonical)
    },
  })

  const { dispatch } = quotedPrice

  const recomputeDerivedField = useCallback(() => {
    const values = getValues()
    const derived = getDerived(values.lastTwo)
    const computed = computeDerived(derived, readFieldValues(values))

    if (derived === "price") {
      setDerivedField("price", computed)
      dispatch({ type: "derived", value: computed })
    } else {
      setDerivedField(derived, computed)
    }
  }, [dispatch, getValues, setDerivedField])

  const onFieldTouch = useCallback(
    (field: FieldName) => {
      const values = getValues()
      const afterTouch = updateLastTwoOnTouch(
        values.lastTwo,
        field,
        values.isLocked,
      )
      const next = repairLastTwo(
        afterTouch,
        readFieldValues(values),
        field,
        values.isLocked,
      )
      const derivedAfterTouch = getDerived(next)
      if (next !== values.lastTwo) setValue("lastTwo", next, SILENT_SET)
      if (derivedAfterTouch === "price") {
        dispatch({ type: "derived", value: values.limitPrice ?? "" })
      }
      debounced(() => {
        recomputeDerivedField()
        trigger(cascadeFieldName(field))
      })
    },
    [debounced, dispatch, getValues, recomputeDerivedField, setValue, trigger],
  )

  const onSellAmountChange = useCallback(
    () => onFieldTouch("sell"),
    [onFieldTouch],
  )
  const onBuyAmountChange = useCallback(
    () => onFieldTouch("buy"),
    [onFieldTouch],
  )

  const onLockToggle = useCallback(() => {
    const values = getValues()
    const nextLocked = !values.isLocked
    setValue("isLocked", nextLocked)
    if (nextLocked) {
      const next = lockSellIntoLastTwo(values.lastTwo)
      if (next !== values.lastTwo) setValue("lastTwo", next, SILENT_SET)
      debounced(recomputeDerivedField)
    }
  }, [getValues, setValue, debounced, recomputeDerivedField])

  const onAssetChange = useCallback(
    (next: Partial<LimitFormValues>) => {
      reset({
        ...getValues(),
        ...next,
        ...(next.sellAsset ? { sellAmount: "" } : {}),
        buyAmount: "",
        lastTwo: ["price", "sell"],
      })
    },
    [getValues, reset],
  )

  return {
    quotedPrice,
    isMarketLoading,
    isRecalculating,
    onSellAmountChange,
    onBuyAmountChange,
    onLockToggle,
    onAssetChange,
  }
}
