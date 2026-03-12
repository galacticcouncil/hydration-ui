import {
  Box,
  Flex,
  Icon,
  NumberInput,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { ArrowLeftRight } from "lucide-react"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { formatNumber } from "@galacticcouncil/utils"
import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  SDenominationPill,
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

const PRICE_ADJUSTMENTS = [
  { label: "-10%", factor: 0.9 },
  { label: "-5%", factor: 0.95 },
  { label: "Market", factor: 1, isMarket: true },
  { label: "+5%", factor: 1.05 },
  { label: "+10%", factor: 1.1 },
] as const

export const LimitForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { tradable, getAsset } = useAssets()
  const navigate = useNavigate()
  const switchAssets = useSwitchAssets()

  const { control, getValues, setValue, reset, trigger, watch } =
    useFormContext<LimitFormValues>()

  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const buyableAssets = useMemo(
    () => tradable.filter((asset) => !SELL_ONLY_ASSETS.includes(asset.id)),
    [tradable],
  )

  const { data: spotPriceData } = useQuery(
    spotPriceQuery(rpc, sellAsset?.id ?? "", buyAsset?.id ?? ""),
  )

  const [selectedFactor, setSelectedFactor] = useState<number>(1)
  const [isPriceInverted, setIsPriceInverted] = useState(true)

  // Reset price direction when assets change
  useEffect(() => {
    setIsPriceInverted(true)
  }, [sellAsset?.id, buyAsset?.id])

  const toDisplayPrice = (internal: string) => {
    if (!internal || Big(internal).eq(0)) return ""
    const raw = isPriceInverted ? Big(1).div(internal).toString() : internal
    return formatNumber(raw, undefined, { useGrouping: false })
  }

  const toInternalPrice = (displayed: string) => {
    if (!displayed || Big(displayed).eq(0)) return ""
    return isPriceInverted ? Big(1).div(displayed).toString() : displayed
  }

  const recalculateBuyAmount = (sellAmount: string, limitPrice: string) => {
    if (!sellAmount || !limitPrice || Big(limitPrice).eq(0)) {
      setValue("buyAmount", "")
      return
    }
    setValue("buyAmount", Big(sellAmount).times(limitPrice).toString())
  }

  const recalculateSellAmount = (buyAmount: string, limitPrice: string) => {
    if (!buyAmount || !limitPrice || Big(limitPrice).eq(0)) {
      setValue("sellAmount", "")
      return
    }
    setValue("sellAmount", Big(buyAmount).div(limitPrice).toString())
  }

  // Prefill limit price with market price on initial load or when assets change
  const prevAssetsRef = useRef<string>("")
  useEffect(() => {
    const assetsKey = `${sellAsset?.id}-${buyAsset?.id}`
    const assetsChanged = prevAssetsRef.current !== assetsKey
    prevAssetsRef.current = assetsKey

    if (!spotPriceData?.spotPrice) return

    const currentLimitPrice = getValues("limitPrice")
    if (!currentLimitPrice || assetsChanged) {
      setValue("limitPrice", spotPriceData.spotPrice)
      setSelectedFactor(1)
      const sellAmount = getValues("sellAmount")
      if (sellAmount) {
        recalculateBuyAmount(sellAmount, spotPriceData.spotPrice)
      }
    }
  }, [spotPriceData, sellAsset?.id, buyAsset?.id, getValues, setValue])

  // When "Market" is selected, keep limit price synced to live spot price every block
  useEffect(() => {
    if (selectedFactor !== 1 || !spotPriceData?.spotPrice) return

    const adjustedPrice = spotPriceData.spotPrice
    setValue("limitPrice", adjustedPrice)
    trigger("limitPrice")

    const sellAmount = getValues("sellAmount")
    if (sellAmount) recalculateBuyAmount(sellAmount, adjustedPrice)
  }, [spotPriceData?.spotPrice, selectedFactor, setValue, trigger, getValues])

  // Ensure default assets are set on mount
  useEffect(() => {
    const { sellAsset, buyAsset, ...values } = getValues()

    if (!sellAsset || !buyAsset) {
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
    sellAsset: TAsset,
    previousSellAsset: TAsset | null,
  ): void => {
    const { buyAsset } = getValues()

    if (sellAsset.id !== buyAsset?.id) {
      trigger("sellAmount")
      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: sellAsset.id,
          assetOut: buyAsset?.id,
        }),
        resetScroll: false,
      })
    } else {
      setValue("sellAsset", previousSellAsset)
      switchAssets.mutate()
    }
  }

  const handleBuyAssetChange = (
    buyAsset: TAsset,
    previousBuyAsset: TAsset | null,
  ): void => {
    const { sellAsset } = getValues()

    if (buyAsset.id !== sellAsset?.id) {
      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: sellAsset?.id,
          assetOut: buyAsset.id,
        }),
        resetScroll: false,
      })
    } else {
      setValue("buyAsset", previousBuyAsset)
      switchAssets.mutate()
    }
  }

  const recalculateLimitPrice = (sellAmount: string, buyAmount: string) => {
    if (!sellAmount || !buyAmount || Big(sellAmount).eq(0)) {
      return
    }
    setValue("limitPrice", Big(buyAmount).div(sellAmount).toString())
    trigger("limitPrice")
    setSelectedFactor(0)
  }

  const handleSellAmountChange = (newSellAmount: string) => {
    recalculateBuyAmount(newSellAmount, getValues("limitPrice"))
  }

  const handleBuyAmountChange = (newBuyAmount: string) => {
    setSelectedFactor(0)
    const sellAmount = getValues("sellAmount")
    if (sellAmount) {
      recalculateLimitPrice(sellAmount, newBuyAmount)
    }
  }

  const handleLimitPriceChange = (newLimitPrice: string) => {
    recalculateBuyAmount(getValues("sellAmount"), newLimitPrice)
  }

  const handlePriceAdjustment = (factor: number) => {
    const marketPrice = spotPriceData?.spotPrice
    if (!marketPrice) return

    setSelectedFactor(factor)
    // When display is inverted (sellAsset per buyAsset), the factor must be applied
    // to the displayed value, which means dividing the internal price instead of multiplying.
    // e.g. displayed=20, +10% → displayed=22 → internal=1/22 = marketInternal/1.1
    const adjustedPrice = isPriceInverted
      ? Big(marketPrice).div(factor).toString()
      : Big(marketPrice).times(factor).toString()
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
        <Flex align="center" gap="s" mb="s" wrap>
          <Text fw={500} fs="p5" color={getToken("text.low")}>
            {t("trade:limit.limitPrice.label")}
          </Text>
          <Flex gap="xxs" ml="auto">
            {PRICE_ADJUSTMENTS.map(({ label, factor }) => (
              <SPriceOption
                key={label}
                active={selectedFactor === factor}
                onClick={() => handlePriceAdjustment(factor)}
              >
                {label}
              </SPriceOption>
            ))}
          </Flex>
        </Flex>
        <Controller
          control={control}
          name="limitPrice"
          render={({ field }) => (
            <NumberInput
              value={toDisplayPrice(field.value)}
              onValueChange={({ value }) => {
                const internal = toInternalPrice(value)
                field.onChange(internal)
                setSelectedFactor(0)
                handleLimitPriceChange(internal)
              }}
              leadingElement={
                <SDenominationPill
                  onClick={() => setIsPriceInverted((prev) => !prev)}
                >
                  <Icon size="s" component={ArrowLeftRight} />
                  {isPriceInverted ? sellAsset?.symbol : buyAsset?.symbol}
                </SDenominationPill>
              }
              allowNegative={false}
              sx={{ textAlign: "right" }}
            />
          )}
        />
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
