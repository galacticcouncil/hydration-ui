import {
  Alert,
  CopyButton,
  Flex,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, Fragment } from "react"
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

  const fields = FIELDS.flatMap((field) => {
    const value = instructions[field]
    return typeof value === "string" ? [{ field, value }] : []
  })

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
      {fields.length > 0 && (
        <Stack
          sx={{
            mx: ["var(--modal-content-inset)", 0],
            borderRadius: [0, "l"],
            "& button": {
              display: "grid",
              placeItems: "center",
              minWidth: [44, 24],
              minHeight: [44, 24],
              flexShrink: 0,
            },
            "--bank-details-surface": getToken(
              "surfaces.containers.dim.dimOnHigh",
            ),
            bg: ["transparent", "var(--bank-details-surface)"],
            borderBlock: ["1px solid", "none"],
            borderColor: getToken("details.separators"),
          }}
        >
          {fields.map(({ field, value }, index) => {
            const label = t(`bank.deposit.instructions.field.${field}`)
            return (
              <Fragment key={field}>
                {index > 0 && <Separator />}
                <Flex
                  align="center"
                  gap="m"
                  px={["var(--modal-content-padding)", "l"]}
                  py={["l", "m"]}
                >
                  <Stack gap="s" flex={1} minWidth={0}>
                    <Text fs="p5" color={getToken("text.medium")}>
                      {label}
                    </Text>
                    <Text fs="p4" fw={500} wordBreak="break-word">
                      {value}
                    </Text>
                  </Stack>
                  <CopyButton
                    text={value}
                    aria-label={t("bank.deposit.instructions.copy", { label })}
                  />
                </Flex>
              </Fragment>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
