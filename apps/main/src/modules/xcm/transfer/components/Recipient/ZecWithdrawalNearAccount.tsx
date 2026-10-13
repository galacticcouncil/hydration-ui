import { AccountInput, Box, Label } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useId } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

/** NEAR account 1Click refunds a failed zcash withdrawal to. */
export const ZecWithdrawalNearAccount: React.FC = () => {
  const { t } = useTranslation("xcm")
  const id = useId()
  const { control } = useFormContext<XcmFormValues>()

  return (
    <Box>
      <Label
        htmlFor={id}
        fs="p5"
        color={getToken("text.medium")}
        pb="base"
        display="block"
      >
        {t("zecWithdrawal.nearAccount.label")}
      </Label>
      <Controller
        control={control}
        name="nearAccount"
        render={({ field }) => (
          <AccountInput
            id={id}
            placeholder={t("zecWithdrawal.nearAccount.placeholder")}
            value={field.value ?? ""}
            onChange={field.onChange}
            autoComplete="off"
          />
        )}
      />
    </Box>
  )
}
