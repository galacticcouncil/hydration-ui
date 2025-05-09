import { Flex, Input, Text, Toggle } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { PeriodInput } from "@/components/PeriodInput"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { DCAFormValues } from "@/modules/trade/sections/DCA/DCA.form"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"

export const DCAForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { control } = useFormContext<DCAFormValues>()
  // TODO integrate
  const { tradable } = useAssets()

  return (
    <div>
      <AssetSelectFormField<DCAFormValues>
        assetFieldName="sellAsset"
        amountFieldName="sellAmount"
        assets={tradable}
      />
      <SwapSectionSeparator />
      <AssetSelectFormField<DCAFormValues>
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        assets={tradable}
      />
      <SwapSectionSeparator />
      <Controller
        control={control}
        name="interval"
        render={({ field }) => (
          <PeriodInput
            label={t("trade:dca.interval.label")}
            period={field.value}
            onPeriodChange={field.onChange}
          />
        )}
      />
      <SwapSectionSeparator />
      <Flex
        justify="space-between"
        py={getTokenPx("containers.paddings.quart")}
      >
        <Text fs="p5" lh={1.4} color={getToken("text.medium")}>
          {t("advancedSettings")}
        </Text>
        <Controller
          control={control}
          name="advancedSettings"
          render={({ field }) => (
            <Toggle checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </Flex>
      <SwapSectionSeparator />
      <Flex
        justify="space-between"
        align="center"
        py={getTokenPx("containers.paddings.quint")}
      >
        <Text fw={500} fs="p3" lh={1} color={getToken("text.medium")}>
          {t("trade:dca.maxRetries")}
        </Text>
        <Controller
          control={control}
          name="maxRetries"
          render={({ field }) => (
            <Input
              sx={{ width: 60 }}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
            />
          )}
        />
      </Flex>
    </div>
  )
}
