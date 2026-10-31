import {
  CopyButton,
  Flex,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, Fragment } from "react"
import { useTranslation } from "react-i18next"

import { DepositCurrency, exampleDetails } from "./deposit.mock"

type BankDepositV3InstructionsProps = { currency: DepositCurrency }

export const BankDepositV3Instructions: FC<BankDepositV3InstructionsProps> = ({
  currency,
}) => {
  const { t } = useTranslation("onramp")
  const fields = [
    "bank",
    ...(currency === "USD"
      ? (["routing", "account"] as const)
      : (["iban", "bic"] as const)),
    "beneficiary",
  ] as const
  return (
    <Stack
      bg={getToken("surfaces.containers.dim.dimOnHigh")}
      borderRadius="l"
      px="l"
      py="s"
      data-bank-v3-details
    >
      {exampleDetails[currency].slice(0, 4).map(({ value }, index) => {
        const label = t(`bankV3.details.${fields[index]!}`)
        return (
          <Fragment key={label}>
            {index > 0 && <Separator />}
            <Flex gap="m" align="center" py="m">
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
                aria-label={t("bankV2.deposit.copy", { label })}
              />
            </Flex>
          </Fragment>
        )
      })}
    </Stack>
  )
}
