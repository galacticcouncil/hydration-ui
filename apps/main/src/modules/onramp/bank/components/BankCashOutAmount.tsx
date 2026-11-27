import {
  ChevronRightIcon,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  FormField,
  Input,
  ModalBody,
  ModalFooter,
  OptionCard,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBankCashOutAmountForm } from "@/modules/onramp/bank/components/BankCashOut.form"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"

type BankCashOutAmountProps = {
  usdcAmount: string
  /** The chosen account's line, or null when none is chosen yet. */
  accountLine: string | null
  /** The destination row; `typed` is the field's text, exactly as typed. */
  onChooseAccount: (typed: string) => void
  onContinue: (usdcAmount: string, typed: string) => void
  /** The list of cash-outs (Transfer step); `typed` as for the row. */
  onViewTransfers: (typed: string) => void
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
  // W01 unmounts when W02 opens: the parent keeps the field's raw text.
  const typed = () => String(form.getValues("usdcAmount") ?? "")
  const submit = form.handleSubmit((values) =>
    onContinue(values.usdcAmount, typed()),
  )

  return (
    <BankStepShell title={t("bank.cashOut.title")} step="amount">
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
        onSubmit={(e) => void submit(e)}
        autoComplete="off"
      >
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
                  <Flex
                    align="center"
                    gap="m"
                    sx={{
                      py: "m",
                      borderBottom: "1px solid",
                      borderColor: getToken("details.separators"),
                      "& input": {
                        textAlign: "right",
                        fontSize: "p2",
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Text fs="p4" fw={600} sx={{ flexShrink: 0 }}>
                      USDC
                    </Text>
                    <Input
                      {...field}
                      variant="embedded"
                      width="100%"
                      placeholder="0"
                      aria-label={t("bank.cashOut.form.amount")}
                      value={String(field.value ?? "")}
                      inputMode="decimal"
                      autoComplete="off"
                      isError={!!fieldState.error}
                    />
                  </Flex>
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
              onClick={() => onChooseAccount(typed())}
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
              onClick={() => onViewTransfers(typed())}
            >
              {t("bank.cashOut.status.viewTransfers")}
            </Button>
          </Stack>
        </ModalFooter>
      </form>
    </BankStepShell>
  )
}
