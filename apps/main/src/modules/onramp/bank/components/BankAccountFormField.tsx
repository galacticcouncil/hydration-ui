import { FormField, Input } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BankAccountFormValues } from "@/modules/onramp/bank/components/BankAccountForm.form"

export type BankAccountTextField = Exclude<
  keyof BankAccountFormValues,
  "rail" | "checkingOrSavings"
>

type BankAccountFormFieldProps = {
  name: BankAccountTextField
}

export const BankAccountFormField: FC<BankAccountFormFieldProps> = ({
  name,
}) => {
  const { t } = useTranslation(["onramp"])
  return (
    <Controller<BankAccountFormValues, BankAccountTextField>
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={t(`bank.accounts.form.${name}`)}
          error={fieldState.error?.message}
        >
          <Input
            {...field}
            autoComplete="off"
            spellCheck={false}
            isError={!!fieldState.error}
          />
        </FormField>
      )}
    />
  )
}
