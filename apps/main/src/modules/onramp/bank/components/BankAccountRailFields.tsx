import { ToggleGroup, ToggleGroupItem } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BankAccountFormValues } from "@/modules/onramp/bank/components/BankAccountForm.form"
import { BankAccountFormField } from "@/modules/onramp/bank/components/BankAccountFormField"

/** The fields of the selected rail only: USD ACH or EUR SEPA (API doc 4). */
export const BankAccountRailFields: FC = () => {
  const { t } = useTranslation(["onramp"])
  const { watch } = useFormContext<BankAccountFormValues>()
  const rail = watch("rail")

  if (rail === "sepa")
    return (
      <>
        <BankAccountFormField name="iban" />
        <BankAccountFormField name="bic" />
        <BankAccountFormField name="bankName" />
      </>
    )

  return (
    <>
      <BankAccountFormField name="bankName" />
      <BankAccountFormField name="accountNumber" />
      <BankAccountFormField name="routingNumber" />
      <Controller<BankAccountFormValues, "checkingOrSavings">
        name="checkingOrSavings"
        render={({ field }) => (
          <ToggleGroup<"checking" | "savings">
            type="single"
            fullWidth
            value={field.value}
            onValueChange={(value) => value && field.onChange(value)}
          >
            <ToggleGroupItem value="checking">
              {t("bank.accounts.form.checking")}
            </ToggleGroupItem>
            <ToggleGroupItem value="savings">
              {t("bank.accounts.form.savings")}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      />
    </>
  )
}
