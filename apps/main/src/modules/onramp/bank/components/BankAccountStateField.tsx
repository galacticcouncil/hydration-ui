import { FC, useMemo } from "react"
import { useFormContext } from "react-hook-form"

import { BankAccountFormValues } from "@/modules/onramp/bank/components/BankAccountForm.form"
import { BankAccountFormField } from "@/modules/onramp/bank/components/BankAccountFormField"
import { BankAccountSelectField } from "@/modules/onramp/bank/components/BankAccountSelectField"
import { usStateOptions } from "@/modules/onramp/bank/utils/addressOptions"

/**
 * The ACH address state: a dropdown of the USPS codes for a US address; for
 * another country, its two-letter code as text (the server takes any two
 * capitals, bankAccountRoutes.mjs:377).
 */
export const BankAccountStateField: FC = () => {
  const { watch } = useFormContext<BankAccountFormValues>()
  const country = watch("country")
  const states = useMemo(() => usStateOptions(), [])

  return country === "USA" ? (
    <BankAccountSelectField key="state-us" name="state" options={states} />
  ) : (
    <BankAccountFormField key="state-other" name="state" />
  )
}
