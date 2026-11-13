import {
  Alert,
  Button,
  LoadingButton,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
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
  /** Rails whose off-ramp is open (`rails` only); the form offers only these. */
  rails: { usd: boolean; eur: boolean }
  onDone: () => void
  onCancel: () => void
}

/**
 * POST /v1/bank-accounts. Bank details are held in this form's state and the
 * mutation's variables, in memory only: not in a URL; not in the global
 * react-query error log (key under SENSITIVE_KEY_ROOTS); not in the portfolio
 * persister (it skips sensitive keys, and HBR mutations never pause:
 * HBR_NETWORK_MODE). Browser extensions reading the page are out of reach.
 * One `clientRequestId` per submission, reused while the same body is sent
 * again (lost on Cancel or remount: then a new id, see utils/bankAccounts.ts).
 */
export const BankAccountForm: FC<BankAccountFormProps> = ({
  h160,
  rails,
  onDone,
  onCancel,
}) => {
  const { t, i18n } = useTranslation(["onramp"])
  const firstRail: BankRail = rails.usd ? "ach" : "sepa"
  const form = useBankAccountForm(firstRail)
  const create = useHbrCreateBankAccount(h160)
  const inFlight = useHbrActionInFlight(h160, "createBankAccount")
  const pending = useRef<BankAccountSubmission | null>(null)
  const rail = form.watch("rail")
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
            form.reset(emptyBankAccountForm(firstRail))
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
        <Stack gap="m">
          <ToggleGroup<BankRail>
            type="single"
            fullWidth
            value={rail}
            onValueChange={(value) => {
              if (!value) return
              pending.current = null
              setInvalid(false)
              form.reset(emptyBankAccountForm(value))
            }}
          >
            <ToggleGroupItem value="ach" disabled={!rails.usd}>
              {t("bank.accounts.form.rail.ach")}
            </ToggleGroupItem>
            <ToggleGroupItem value="sepa" disabled={!rails.eur}>
              {t("bank.accounts.form.rail.sepa")}
            </ToggleGroupItem>
          </ToggleGroup>
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
          {/* Read from the mutation cache: a remount still sees the pending POST. */}
          <LoadingButton
            type="submit"
            size="large"
            isLoading={inFlight.pending}
            disabled={inFlight.pending}
          >
            {inFlight.pending
              ? t("bank.accounts.form.saving")
              : t("bank.accounts.form.submit")}
          </LoadingButton>
          <Button
            type="button"
            size="large"
            variant="tertiary"
            disabled={create.isPending}
            onClick={onCancel}
          >
            {t("bank.accounts.form.cancel")}
          </Button>
        </Stack>
      </form>
    </FormProvider>
  )
}
