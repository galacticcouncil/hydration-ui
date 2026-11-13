import {
  Alert,
  LoadingButton,
  ModalBody,
  ModalFooter,
  Stack,
} from "@galacticcouncil/ui/components"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  BankRail,
  emptyBankAccountForm,
  SEPA_IBAN_COUNTRIES,
  toBankAccountBody,
  useBankAccountForm,
} from "@/modules/onramp/bank/components/BankAccountForm.form"
import { BankAccountFormField } from "@/modules/onramp/bank/components/BankAccountFormField"
import { BankAccountRailFields } from "@/modules/onramp/bank/components/BankAccountRailFields"
import { BankAccountSelectField } from "@/modules/onramp/bank/components/BankAccountSelectField"
import { BankAccountStateField } from "@/modules/onramp/bank/components/BankAccountStateField"
import type { CreateBankAccountRequest } from "@/modules/onramp/bank/config/schemas"
import {
  useHbrActionInFlight,
  useHbrCreateBankAccount,
} from "@/modules/onramp/bank/hooks/useHbr"
import {
  alpha3FromAlpha2,
  countryOptions,
} from "@/modules/onramp/bank/utils/addressOptions"
import {
  BankAccountSubmission,
  classifyCreateBankAccountError,
  isBankAccountSubmissionDone,
  nextBankAccountSubmission,
} from "@/modules/onramp/bank/utils/bankAccounts"

type BankAccountFormProps = {
  h160: string
  /** The rail picked on the step before (only an open one is offered there). */
  rail: BankRail
  onDone: () => void
}

/**
 * POST /v1/bank-accounts. Bank details are held in this form's state and the
 * mutation's variables, in memory only: not in a URL; not in the global
 * react-query error log (key under SENSITIVE_KEY_ROOTS); not in the portfolio
 * persister (it skips sensitive keys, and HBR mutations never pause:
 * HBR_NETWORK_MODE). Browser extensions reading the page are out of reach.
 * One `clientRequestId` per submission, reused while the same body is sent
 * again (lost on back or remount: then a new id, see utils/bankAccounts.ts).
 * Figma W03/W04 (pattern P05): the rail is chosen first, so this form holds
 * one rail's fields only; another rail is a new form.
 */
export const BankAccountForm: FC<BankAccountFormProps> = ({
  h160,
  rail,
  onDone,
}) => {
  const { t, i18n } = useTranslation(["onramp"])
  const form = useBankAccountForm(rail)
  const create = useHbrCreateBankAccount(h160)
  const inFlight = useHbrActionInFlight(h160, "createBankAccount")
  const pending = useRef<BankAccountSubmission | null>(null)
  const countries = useMemo(
    () => countryOptions(i18n?.language || "en"),
    [i18n?.language],
  )

  // SEPA: preselect the address country from the IBAN's first two letters,
  // until the user picks one; a picked country is never changed for them.
  const iban = form.watch("iban")
  useEffect(() => {
    if (rail !== "sepa") return
    if (form.getFieldState("country").isDirty) return
    const prefix = iban.replace(/\s+/g, "").slice(0, 2).toUpperCase()
    const fromIban = SEPA_IBAN_COUNTRIES.has(prefix)
      ? alpha3FromAlpha2(prefix)
      : null
    if (fromIban) form.setValue("country", fromIban, { shouldDirty: false })
  }, [rail, iban, form])

  // A refused submit always says so, even when the failing field is not
  // rendered (it can never block silently).
  const [invalid, setInvalid] = useState(false)
  const submit = form.handleSubmit(
    (values) => {
      setInvalid(false)
      // One POST at a time: a second click before the re-render sends nothing.
      if (!inFlight.isFree()) return
      const body = toBankAccountBody(values)
      const submission = nextBankAccountSubmission(pending.current, body, () =>
        crypto.randomUUID(),
      )
      pending.current = submission
      create.mutate(
        {
          clientRequestId: submission.clientRequestId,
          ...body,
        } as CreateBankAccountRequest,
        {
          onSuccess: () => {
            pending.current = null
            form.reset(emptyBankAccountForm(rail))
            onDone()
          },
          onError: (error) => {
            if (isBankAccountSubmissionDone(error)) pending.current = null
          },
        },
      )
    },
    () => setInvalid(true),
  )

  const errorView = create.isError
    ? classifyCreateBankAccountError(create.error)
    : null

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} autoComplete="off">
        <ModalBody>
          <Stack gap="m">
            <BankAccountRailFields />
            <BankAccountFormField name="streetLine1" />
            <BankAccountFormField name="streetLine2" />
            <BankAccountFormField name="city" />
            {rail === "ach" && <BankAccountStateField />}
            <BankAccountFormField name="postalCode" />
            <BankAccountSelectField name="country" options={countries} />
            {invalid && (
              <Alert
                variant="warning"
                description={t("bank.accounts.form.error.summary")}
              />
            )}
            {errorView && (
              <Alert
                variant={errorView.kind === "uncertain" ? "info" : "warning"}
                description={
                  errorView.kind === "serverDetail"
                    ? errorView.detail
                    : errorView.kind === "railUnavailable"
                      ? t("bank.accounts.error.railUnavailable", {
                          gate: errorView.gate ?? "-",
                        })
                      : t(`bank.accounts.error.${errorView.kind}`)
                }
              />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          {/* Read from the mutation cache: a remount still sees the pending POST. */}
          <LoadingButton
            type="submit"
            size="large"
            width="100%"
            isLoading={inFlight.pending}
            disabled={inFlight.pending}
          >
            {inFlight.pending
              ? t("bank.accounts.form.saving")
              : t("bank.accounts.form.submit")}
          </LoadingButton>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
