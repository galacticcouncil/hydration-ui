import {
  ChevronRightIcon,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  FormField,
  Input,
  ModalBody,
  ModalFooter,
  OptionCard,
  Stack,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBankCashOutAmountForm } from "@/modules/onramp/bank/components/BankCashOut.form"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"

type BankCashOutAmountProps = {
  usdcAmount: string
  /** The chosen account's line, or null when none is chosen yet. */
  accountLine: string | null
  onChooseAccount: () => void
  onContinue: (usdcAmount: string) => void
  /** The list of cash-outs (Transfer step). */
  onViewTransfers: () => void
}

/**
 * Figma W01: the amount to cash out, in USDC (the unit the API takes), and
 * the destination bank row. No "You receive" here: the only figures shown
 * for a cash-out are the server's quote, on the review (rule 2 of the brief).
 */
export const BankCashOutAmount: FC<BankCashOutAmountProps> = ({
  usdcAmount,
  accountLine,
  onChooseAccount,
  onContinue,
  onViewTransfers,
}) => {
  const { t } = useTranslation(["onramp"])
  const form = useBankCashOutAmountForm(usdcAmount)
  const submit = form.handleSubmit((values) => onContinue(values.usdcAmount))

  return (
    <BankStepShell title={t("bank.cashOut.title")} step="amount">
      <form onSubmit={(e) => void submit(e)} autoComplete="off">
        <ModalBody>
          <Stack gap="l">
            <Controller
              control={form.control}
              name="usdcAmount"
              render={({ field, fieldState }) => (
                <FormField
                  label={t("bank.cashOut.form.amount")}
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    value={String(field.value ?? "")}
                    inputMode="decimal"
                    autoComplete="off"
                    isError={!!fieldState.error}
                  />
                </FormField>
              )}
            />
            <OptionCard
              icon={LandmarkIcon}
              label={t("bank.cashOut.form.destination")}
              description={
                accountLine ?? t("bank.cashOut.form.destinationNone")
              }
              value={<ChevronRightIcon />}
              isActive={false}
              onClick={onChooseAccount}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Stack gap="m" width="100%">
            <Button type="submit" size="large">
              {t("bank.flow.continue")}
            </Button>
            <Button
              type="button"
              size="large"
              variant="tertiary"
              onClick={onViewTransfers}
            >
              {t("bank.cashOut.status.viewTransfers")}
            </Button>
          </Stack>
        </ModalFooter>
      </form>
    </BankStepShell>
  )
}
