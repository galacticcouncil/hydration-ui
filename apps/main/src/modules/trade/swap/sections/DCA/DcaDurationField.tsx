import {
  Box,
  Flex,
  Grid,
  NumberInput,
  Text,
  TextProps,
  Toggle,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller, useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TimeFrameFormField } from "@/form/TimeFrameFormField"
import {
  DcaFormValues,
  DcaOrders,
  DcaOrdersMode,
  dcaTimeFrameTypes,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"

export const DcaDurationField: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { control, formState, trigger } = useFormContext<DcaFormValues>()

  const { field: ordersField } = useController({
    control,
    name: "orders",
  })

  const isAuto = ordersField.value.type === DcaOrdersMode.Auto

  const ordersError =
    formState.errors.duration?.value?.message ??
    formState.errors.orders?.value?.message

  return (
    <Grid
      pt={getTokenPx("scales.paddings.l")}
      pb={getTokenPx("scales.paddings.xxl")}
      columnTemplate="minmax(0,1fr) minmax(0,1fr)"
      rowGap={8}
      columnGap={getTokenPx("containers.paddings.primary")}
    >
      <Label>{t("trade:dca.duration.label")}</Label>
      <Flex
        sx={{ justifySelf: "end" }}
        gap={getTokenPx("scales.paddings.s")}
        align="center"
      >
        <ToggleRoot>
          <Label>
            {t("trade:dca.orders.label")}:{" "}
            <Box as="span" color={getToken("text.tint.secondary")}>
              {isAuto ? t("auto") : t("custom")}
            </Box>
          </Label>
          <Toggle
            checked={isAuto}
            onCheckedChange={(auto) =>
              ordersField.onChange(
                (auto
                  ? { type: DcaOrdersMode.Auto }
                  : {
                      type: DcaOrdersMode.Custom,
                      value: null,
                    }) satisfies DcaOrders,
              )
            }
          />
        </ToggleRoot>
      </Flex>

      <TimeFrameFormField<DcaFormValues>
        sx={{
          gridColumn: isAuto ? "1/-1" : "1",
        }}
        fieldName="duration"
        allowedTypes={new Set(dcaTimeFrameTypes)}
        onChange={() => trigger("orders.value")}
      />
      {!isAuto && (
        <Controller
          control={control}
          name="orders.value"
          render={({ field, fieldState }) => (
            <NumberInput
              value={field.value}
              decimalScale={0}
              allowNegative={false}
              keepInvalidInput
              onValueChange={({ floatValue }) => field.onChange(floatValue)}
              isError={!!fieldState.error?.message}
              unit={t("trade:dca.orders.unit")}
            />
          )}
        />
      )}
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
  )
}

const Label: FC<TextProps> = (props) => {
  return (
    <Text fw={500} fs="p5" lh={1.2} color={getToken("text.low")} {...props} />
  )
}
