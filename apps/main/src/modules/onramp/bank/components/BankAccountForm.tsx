import {
  Alert,
  Button,
  LoadingButton,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { FC, useRef } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  BankRail,
  emptyBankAccountForm,
  toBankAccountBody,
  useBankAccountForm,
} from "@/modules/onramp/bank/components/BankAccountForm.form"
import { BankAccountFormField } from "@/modules/onramp/bank/components/BankAccountFormField"
import { BankAccountRailFields } from "@/modules/onramp/bank/components/BankAccountRailFields"
import type { CreateBankAccountRequest } from "@/modules/onramp/bank/config/schemas"
import { useHbrCreateBankAccount } from "@/modules/onramp/bank/hooks/useHbr"
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
 * POST /v1/bank-accounts. Bank details live in this form's memory only: no
 * persist, no URL, no log (the mutation key is under the HBR root). One
 * `clientRequestId` per submission, reused while the same body is sent again.
 */
export const BankAccountForm: FC<BankAccountFormProps> = ({
  h160,
  rails,
  onDone,
  onCancel,
}) => {
  const { t } = useTranslation(["onramp"])
  const firstRail: BankRail = rails.usd ? "ach" : "sepa"
  const form = useBankAccountForm(firstRail)
  const create = useHbrCreateBankAccount(h160)
  const pending = useRef<BankAccountSubmission | null>(null)
  const rail = form.watch("rail")

  const submit = form.handleSubmit((values) => {
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
  })

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
          {rail === "ach" && <BankAccountFormField name="state" />}
          <BankAccountFormField name="postalCode" />
          <BankAccountFormField name="country" />
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
          <LoadingButton
            type="submit"
            size="large"
            isLoading={create.isPending}
            disabled={create.isPending}
          >
            {t("bank.accounts.form.submit")}
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
