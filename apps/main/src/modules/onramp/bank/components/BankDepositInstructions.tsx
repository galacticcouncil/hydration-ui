import {
  Alert,
  CopyButton,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import type { OnrampCurrency } from "@/modules/onramp/bank/config/schemas"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

type Instructions = Record<string, string | string[] | undefined>

type BankDepositInstructionsProps = {
  currency: OnrampCurrency
  instructions: Instructions
  minimumDeposit: string | null
}

// Display order of INSTRUCTION_FIELDS (onrampAccountView.mjs); rails apart.
const FIELDS = [
  "bankName",
  "routingNumber",
  "accountNumber",
  "iban",
  "bic",
  "beneficiaryName",
  "accountHolderName",
  "bankAddress",
  "beneficiaryAddress",
  "paymentRail",
] as const

/**
 * Rule 5: shown only as returned for a `ready` view, copied unchanged, with
 * currency and rail beside them. Not stored, not logged; the parent stops
 * rendering this as soon as a read is not `ready`.
 */
export const BankDepositInstructions: FC<BankDepositInstructionsProps> = ({
  currency,
  instructions,
  minimumDeposit,
}) => {
  const { t } = useTranslation(["onramp"])
  const rails = instructions.paymentRails
  const minimum = minimumDeposit ? formatUsdcBaseUnits(minimumDeposit) : null

  return (
    <Stack gap="m">
      <Alert
        variant="info"
        description={t(`bank.deposit.instructions.notice.${currency}`)}
      />
      <Flex justify="space-between">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("bank.deposit.instructions.currency")}
        </Text>
        <Text fs="p5" fw={500}>
          {t(`bank.deposit.currency.${currency}`)}
        </Text>
      </Flex>
      {Array.isArray(rails) && (
        <Flex justify="space-between">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("bank.deposit.instructions.rails")}
          </Text>
          <Text fs="p5" fw={500}>
            {rails.join(", ")}
          </Text>
        </Flex>
      )}
      {FIELDS.map((field) => {
        const value = instructions[field]
        if (typeof value !== "string") return null
        return (
          <Flex key={field} align="center" justify="space-between" gap="m">
            <Stack>
              <Text fs="p5" color={getToken("text.medium")}>
                {t(`bank.deposit.instructions.field.${field}`)}
              </Text>
              <Text fs="p4" fw={500}>
                {value}
              </Text>
            </Stack>
            <CopyButton text={value} />
          </Flex>
        )
      })}
      {minimum && (
        <Text fs="p5" color={getToken("text.low")}>
          {t("bank.deposit.instructions.minimum", { amount: minimum })}
        </Text>
      )}
    </Stack>
  )
}
