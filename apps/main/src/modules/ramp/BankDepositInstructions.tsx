import { CopyButton, Flex, Summary, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DepositCurrency, exampleDetails } from "./deposit.mock"

type BankDepositInstructionsProps = { currency: DepositCurrency }

export const BankDepositInstructions: FC<BankDepositInstructionsProps> = ({
  currency,
}) => {
  const { t } = useTranslation("onramp")
  return (
    <Summary
      rows={exampleDetails[currency].map(({ label, value }) => ({
        label,
        content: (
          <Flex gap="m" align="center" justify="flex-end" minWidth={0}>
            <Text fs="p5" fw={500} align="right" wordBreak="break-word">
              {value}
            </Text>
            <CopyButton
              text={value}
              aria-label={t("bankV2.deposit.copy", { label })}
            />
          </Flex>
        ),
      }))}
    />
  )
}
