import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Box, Grid, NumberInput, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { periodTypes } from "@/components/PeriodInput/PeriodInput.utils"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { PeriodFormField } from "@/form/PeriodFormField"
import { DcaAssetSwitcher } from "@/modules/trade/swap/sections/DCA/DcaAssetSwitcher"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined
}

export const DcaForm: FC<Props> = ({ order }) => {
  const { t } = useTranslation(["common", "trade"])
  const { control, formState, getValues, setValue } =
    useFormContext<DcaFormValues>()

  const { tradable } = useAssets()
  const switchAssets = useSwitchAssets()

  const navigate = useNavigate()
  const search = useSearch({ from: "/trade/_history" })

  const buyableAssets = tradable.filter(
    (asset) => !SELL_ONLY_ASSETS.includes(asset.id),
  )

  const handlesellAssetChange = (
    sellAsset: TAsset,
    previousSellAsset: TAsset | null,
  ): void => {
    const { buyAsset } = getValues()

    if (sellAsset.id !== buyAsset?.id) {
      navigate({
        to: ".",
        search: {
          ...search,
          assetIn: sellAsset.id,
          assetOut: buyAsset?.id,
        },
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
        search: { ...search, assetIn: sellAsset?.id, assetOut: buyAsset.id },
        resetScroll: false,
      })

      return
    }

    setValue("buyAsset", previousBuyAsset)
    switchAssets.mutate()
  }

  const ordersError =
    formState.errors.frequency?.value?.message ??
    formState.errors.root?.period?.message ??
    formState.errors.orders?.message

  return (
    <Box>
      <AssetSelectFormField<DcaFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        assets={tradable}
        label={t("trade:dca.assetIn.title")}
        maxBalanceFallback="0"
        onAssetChange={handlesellAssetChange}
      />
      <DcaAssetSwitcher />
      <Controller
        control={control}
        name="buyAsset"
        render={({ field, fieldState }) => (
          <AssetSelect
            selectedAsset={field.value}
            setSelectedAsset={(buyAsset) => {
              field.onChange(buyAsset)
              handleBuyAssetChange(buyAsset, field.value)
            }}
            assets={buyableAssets}
            label={t("trade:dca.assetOu.title")}
            ignoreBalance
            value={
              field.value && order
                ? scaleHuman(order.amountOut, field.value.decimals)
                : ""
            }
            error={fieldState.error?.message}
          />
        )}
      />
      <SwapSectionSeparator />
      <Grid
        pt={getTokenPx("scales.paddings.l")}
        pb={getTokenPx("scales.paddings.xxl")}
        columnTemplate="1fr 1fr"
        rowGap={8}
        columnGap={getTokenPx("containers.paddings.primary")}
      >
        {[t("every"), t("over")].map((label, i) => (
          <Text key={i} fw={500} fs="p5" lh={1.2} color={getToken("text.low")}>
            {label}
          </Text>
        ))}
        <Box>
          <PeriodFormField<DcaFormValues>
            typeName="frequency.type"
            valueName="frequency.value"
            allowedPeriodTypes={
              new Set(
                periodTypes.filter((periodType) => periodType !== "month"),
              )
            }
          />
        </Box>
        <Controller
          control={control}
          name="orders"
          render={({ field, fieldState }) => (
            <NumberInput
              value={field.value}
              decimalScale={0}
              allowNegative={false}
              onValueChange={({ floatValue }) => field.onChange(floatValue)}
              isError={!!fieldState.error?.message}
              unit={t("trade:dca.orders.unit")}
            />
          )}
        />
        {ordersError && (
          <Text
            sx={{ gridColumn: "1/-1" }}
            font="secondary"
            fw={400}
            fs={12}
            lh={1}
            color={getToken("accents.danger.secondary")}
            ml="auto"
          >
            {ordersError}
          </Text>
        )}
      </Grid>
    </Box>
  )
}
