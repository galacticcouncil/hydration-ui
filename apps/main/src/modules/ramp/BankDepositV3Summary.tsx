import { ArrowRight, FiatEur, FiatUsd } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Image, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import hollarIcon from "@/assets/ramp/Hollar.svg"

import { DepositCurrency } from "./deposit.mock"
import { BANK_DEPOSIT_PREVIEW_WALLET } from "./useBankDepositFlow"

type BankDepositV3SummaryProps = { amount: string; currency: DepositCurrency }

export const BankDepositV3Summary: FC<BankDepositV3SummaryProps> = ({
  amount,
  currency,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  return (
    <Flex
      gap="base"
      align="center"
      p="l"
      borderRadius="l"
      bg={getToken("surfaces.containers.dim.dimOnHigh")}
    >
      <Stack gap="base" flex={1} minWidth={0}>
        <Text fs="p6" color={getToken("text.low")}>
          {t("bankV3.deposit.send")}
        </Text>
        <Flex gap="base" align="center">
          <Icon component={currency === "USD" ? FiatUsd : FiatEur} size={28} />
          <Stack minWidth={0}>
            <Text fs="p4" fw={600} wordBreak="break-word">
              {t("common:currency", { value: amount, symbol: currency })}
            </Text>
            <Text fs="p6" color={getToken("text.medium")}>
              {t("bankV3.deposit.bankTransfer")}
            </Text>
          </Stack>
        </Flex>
      </Stack>
      <Icon component={ArrowRight} size="m" color={getToken("text.low")} />
      <Stack gap="base" flex={1} minWidth={0}>
        <Text fs="p6" color={getToken("text.low")}>
          {t("bankV3.deposit.receive")}
        </Text>
        <Flex gap="base" align="center">
          <Image
            src={hollarIcon}
            alt=""
            aria-hidden
            lazy={false}
            sx={{ size: pxToRem(30), flexShrink: 0 }}
          />
          <Stack minWidth={0}>
            <Text fs="p4" fw={600} wordBreak="break-word">
              {t("common:currency", { value: amount, symbol: "HOLLAR" })}
            </Text>
            <Text
              fs="p6"
              color={getToken("text.medium")}
              wordBreak="break-word"
            >
              {t("bankV3.deposit.wallet", {
                wallet: BANK_DEPOSIT_PREVIEW_WALLET,
              })}
            </Text>
          </Stack>
        </Flex>
      </Stack>
    </Flex>
  )
}
