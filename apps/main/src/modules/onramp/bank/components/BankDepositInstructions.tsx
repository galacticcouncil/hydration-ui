import {
  Alert,
  CopyButton,
  Flex,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import type { OnrampCurrency } from "@/modules/onramp/bank/config/schemas"
import {
  formatUsdcBaseUnits,
  getRailLabels,
} from "@/modules/onramp/bank/utils/onramp"

type Instructions = Record<string, string | string[] | undefined>

type BankDepositInstructionsProps = {
  currency: OnrampCurrency
  instructions: Instructions
  minimumDeposit: string | null
  /** The session's wallet the deposits mint to (shown shortened in the notice). */
  wallet: string
}

// Display order of INSTRUCTION_FIELDS (onrampAccountView.mjs). The rails
// (paymentRails and the USD singular paymentRail) are one labelled row apart.
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
] as const

/**
 * Rule 5: shown only as returned for a `ready` view, copied unchanged, with
 * currency and rail beside them. Not stored, not logged; the parent stops
 * rendering this as soon as a read is not `ready`. Figma D06: the notice,
 * then one row per field with its copy button.
 */
export const BankDepositInstructions: FC<BankDepositInstructionsProps> = ({
  currency,
  instructions,
  minimumDeposit,
  wallet,
}) => {
  const { t } = useTranslation(["onramp"])
  const rails = instructions.paymentRails
  const single = instructions.paymentRail
  const railNames = getRailLabels([
    ...(Array.isArray(rails) ? rails : []),
    ...(typeof single === "string" ? [single] : []),
  ])
  const minimum = minimumDeposit ? formatUsdcBaseUnits(minimumDeposit) : null
  const shortWallet = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`

  return (
    <Stack gap="m">
      <Alert
        variant="info"
        description={[
          t(`bank.deposit.instructions.notice.${currency}`, {
            wallet: shortWallet,
          }),
          minimum
            ? t("bank.deposit.instructions.minimum", { amount: minimum })
            : null,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <Flex justify="space-between" gap="m">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("bank.deposit.instructions.currency")}
        </Text>
        <Text fs="p5" fw={500}>
          {t(`bank.deposit.currency.${currency}`)}
        </Text>
      </Flex>
      {railNames.length > 0 && (
        <Flex justify="space-between" gap="m">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("bank.deposit.instructions.rails")}
          </Text>
          <Text fs="p5" fw={500} data-rails={railNames.join("|")}>
            {railNames.join(", ")}
          </Text>
        </Flex>
      )}
      <Separator />
      {FIELDS.map((field) => {
        const value = instructions[field]
        if (typeof value !== "string") return null
        return (
          <Stack key={field} gap="m">
            <Flex align="center" justify="space-between" gap="m">
              <Stack gap="xs">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t(`bank.deposit.instructions.field.${field}`)}
                </Text>
                <Text fs="p3" fw={500} sx={{ wordBreak: "break-all" }}>
                  {value}
                </Text>
              </Stack>
              <CopyButton text={value} />
            </Flex>
            <Separator />
          </Stack>
        )
      })}
    </Stack>
  )
}
