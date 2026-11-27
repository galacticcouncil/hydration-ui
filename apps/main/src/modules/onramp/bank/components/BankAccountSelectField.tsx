import { FormField, Select } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BankAccountFormValues } from "@/modules/onramp/bank/components/BankAccountForm.form"
import type { AddressOption } from "@/modules/onramp/bank/utils/addressOptions"

type BankAccountSelectFieldProps = {
  name: "country" | "state"
  options: AddressOption[]
}

/** A form field whose value is one of `options` (the code the API takes). */
export const BankAccountSelectField: FC<BankAccountSelectFieldProps> = ({
  name,
  options,
}) => {
  const { t } = useTranslation(["onramp"])
  return (
    <Controller<BankAccountFormValues, "country" | "state">
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={t(`bank.accounts.form.${name}`)}
          error={fieldState.error?.message}
        >
          <Select<string>
            data-field={field.name}
            items={options}
            value={field.value || undefined}
            placeholder={t(`bank.accounts.form.${name}Placeholder`)}
            fullWidth
            onValueChange={(value) => field.onChange(value)}
          />
        </FormField>
      )}
    />
  )
}
