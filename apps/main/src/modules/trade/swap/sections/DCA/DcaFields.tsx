import {
  Box,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useNavigate } from "@tanstack/react-router"
import { FC, useEffect } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  DEFAULT_TRADE_ASSET_IN_ID,
  DEFAULT_TRADE_ASSET_OUT_ID,
} from "@/modules/trade/swap/lib/swapTabSearch"
import { DcaAssetSwitcher } from "@/modules/trade/swap/sections/DCA/DcaAssetSwitcher"
import {
  DcaFormValues,
  DcaOrdersMode,
  DEFAULT_DCA_DURATION,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { XcChainAssetSelect } from "@/modules/trade/swap/sections/XcSwap/components/XcChainAssetSelect"
import { getXcAssetId } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import { XcChainAssetPair } from "@/modules/trade/swap/sections/XcSwap/types"
import {
  toHydrationXcAsset,
  useXcTwapAssetPairs,
} from "@/modules/trade/swap/sections/XcTwap/hooks/useXcTwapAssetPairs"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useIsIceEnabled } from "@/states/intents"

type Props = {
  readonly maxBalance: string
}

export const DcaFields: FC<Props> = ({ maxBalance }) => {
  const { t } = useTranslation(["common", "trade"])
  const isIceEnabled = useIsIceEnabled()
  const { control, getValues, setValue, reset, trigger, watch } =
    useFormContext<DcaFormValues>()

  const isOpenBudget = watch("orders.type") === DcaOrdersMode.OpenBudget

  const { tradable, getAsset } = useAssets()
  const switchAssets = useSwitchAssets()
  const { chainAssetPairs, hydrationChain } = useXcTwapAssetPairs()

  const navigate = useNavigate()

  useEffect(() => {
    if (!isIceEnabled) {
      setValue("limitEnabled", false)
    }
  }, [isIceEnabled, setValue])

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
      reset({ ...getValues(), sellAsset, sellAmount: "" })

      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: sellAsset.id,
          assetOut: buyAsset?.id,
        }),
        resetScroll: false,
      })

      return
    }

    setValue("sellAsset", previousSellAsset)
    switchAssets.mutate()
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

      return
    }

    setValue("buyAsset", previousBuyAsset)
    switchAssets.mutate()
  }

  // A cross-chain destination switches TwapTab to XcTwap, which starts empty.
  const handleCrossChainSelect = ({ chain, asset }: XcChainAssetPair): void => {
    const { sellAsset } = getValues()

    setValue("sellAmount", "")

    navigate({
      to: ".",
      search: (search) => ({
        ...search,
        assetIn: sellAsset?.id ?? search.assetIn,
        assetOut: getXcAssetId(asset) ?? search.assetOut,
        destPlatform: chain.platform,
      }),
      resetScroll: false,
    })
  }

  return (
    <Box>
      <Controller
        control={control}
        name="orders"
        render={({ field }) => (
          <Box mt="m">
            <ToggleGroup
              type="single"
              fullWidth
              value={
                field.value.type === DcaOrdersMode.OpenBudget
                  ? DcaOrdersMode.OpenBudget
                  : DcaOrdersMode.Auto
              }
              onValueChange={(type) => {
                if (!type) return

                reset({
                  ...getValues(),
                  orders: {
                    ...(type === DcaOrdersMode.OpenBudget
                      ? { type, useSplitTrade: true }
                      : { type }),
                  },
                  duration: DEFAULT_DCA_DURATION,
                })

                trigger()
              }}
            >
              <ToggleGroupItem value={DcaOrdersMode.Auto}>
                {t("trade:trade.orders.limitedBudget")}
              </ToggleGroupItem>
              <ToggleGroupItem value={DcaOrdersMode.OpenBudget}>
                {t("trade:trade.orders.openBudget")}
              </ToggleGroupItem>
            </ToggleGroup>
          </Box>
        )}
      />
      <Box py="l" width="100%">
        <AssetSelectFormField<DcaFormValues>
          assetFieldName="sellAsset"
          amountFieldName="sellAmount"
          assets={tradable}
          label={
            isOpenBudget
              ? t("trade:dca.assetIn.title.open")
              : t("trade:dca.assetIn.title")
          }
          balance={{ value: maxBalance }}
          onAssetChange={handleSellAssetChange}
        />
      </Box>
      <DcaAssetSwitcher />
      <Controller
        control={control}
        name="buyAsset"
        render={({ field, fieldState }) => (
          <Box py="l" width="100%">
            <XcChainAssetSelect
              label={t("buy")}
              chainAssetPairs={chainAssetPairs}
              selectedChain={hydrationChain}
              selectedAsset={
                field.value ? toHydrationXcAsset(field.value) : null
              }
              modalTitle={t("trade:xc.swap.field.destTitle")}
              isAmountHidden
              assetError={fieldState.error?.message}
              onSelectionChange={(selection) => {
                if (selection.chain.key !== HYDRATION_CHAIN_KEY) {
                  handleCrossChainSelect(selection)
                  return
                }

                const buyAsset = getAsset(getXcAssetId(selection.asset) ?? "")
                if (!buyAsset) return

                field.onChange(buyAsset)
                handleBuyAssetChange(buyAsset, field.value)
              }}
            />
          </Box>
        )}
      />
    </Box>
  )
}
