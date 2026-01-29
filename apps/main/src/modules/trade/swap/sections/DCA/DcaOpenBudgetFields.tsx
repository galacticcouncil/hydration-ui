import { Grid } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TimeFrameFormField } from "@/form/TimeFrameFormField"
import { DcaFieldError } from "@/modules/trade/swap/sections/DCA/DcaFieldError"
import { DcaFieldLabel } from "@/modules/trade/swap/sections/DCA/DcaFieldLabel"
import {
  DcaFormValues,
  dcaTimeFrameTypes,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"

export const DcaOpenBudgetFields: FC = () => {
  const { t } = useTranslation(["trade"])
  const { formState, trigger } = useFormContext<DcaFormValues>()

  const ordersError = formState.errors.duration?.value?.message

  return (
    <Grid
      pt={getTokenPx("scales.paddings.l")}
      pb={getTokenPx("scales.paddings.xxl")}
      rowGap={8}
    >
      <DcaFieldLabel>{t("trade:dca.duration.label.open")}</DcaFieldLabel>
      <TimeFrameFormField<DcaFormValues>
        fieldName="duration"
        allowedTypes={new Set(dcaTimeFrameTypes)}
        onChange={() => trigger("orders.value")}
      />
      {ordersError && <DcaFieldError>{ordersError}</DcaFieldError>}
    </Grid>
  )
}
