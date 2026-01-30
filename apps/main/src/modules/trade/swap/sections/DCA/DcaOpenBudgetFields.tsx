import {
  Flex,
  Grid,
  SummaryRowLabel,
  Text,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TimeFrameFormField } from "@/form/TimeFrameFormField"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { DcaFieldError } from "@/modules/trade/swap/sections/DCA/DcaFieldError"
import { DcaFieldLabel } from "@/modules/trade/swap/sections/DCA/DcaFieldLabel"
import {
  DcaFormValues,
  dcaTimeFrameTypes,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"

export const DcaOpenBudgetFields: FC = () => {
  const { t } = useTranslation(["trade"])
  const { control, formState, trigger } = useFormContext<DcaFormValues>()

  const ordersError = formState.errors.duration?.value?.message

  return (
    <Flex direction="column">
      <Grid pt="l" pb="xxl" rowGap="base">
        <DcaFieldLabel>{t("trade:dca.duration.label.open")}</DcaFieldLabel>
        <TimeFrameFormField<DcaFormValues>
          fieldName="duration"
          allowedTypes={new Set(dcaTimeFrameTypes)}
          onChange={() => trigger("orders.value")}
        />
        {ordersError && <DcaFieldError>{ordersError}</DcaFieldError>}
      </Grid>
      <SwapSummaryRow
        label={
          <SummaryRowLabel color={getToken("text.tint.secondary")}>
            {t("trade:dca.summary.splitTrade")}:
          </SummaryRowLabel>
        }
        content={
          <Flex align="center" gap={6}>
            <Text fs="p6" lh="xs" color={getToken("text.tint.secondary")}>
              {t("trade:dca.summary.splitTrade.tradeSize")}
            </Text>
            <Tooltip
              text={t("trade:dca.summary.splitTrade.tradeSize.tooltip")}
            />
            <Controller
              control={control}
              name="orders.useSplitTrade"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </Flex>
        }
      />
    </Flex>
  )
}
