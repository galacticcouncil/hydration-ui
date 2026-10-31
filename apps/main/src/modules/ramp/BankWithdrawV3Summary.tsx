import { ArrowRight, LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Image, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import hollarIcon from "@/assets/ramp/Hollar.svg"

import { BankWithdrawalQuote } from "./BankWithdraw.utils"
import { BANK_DEPOSIT_PREVIEW_WALLET } from "./useBankDepositFlow"

type BankWithdrawV3SummaryProps = {
  quote: BankWithdrawalQuote
  bankAccount: string
}

export const BankWithdrawV3Summary: FC<BankWithdrawV3SummaryProps> = ({
  quote,
  bankAccount,
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
          {t("bankV2.withdraw.review.sell")}
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
              {t("common:currency", { value: quote.amount, symbol: "HOLLAR" })}
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
      <Icon component={ArrowRight} size="m" color={getToken("text.low")} />
      <Stack gap="base" flex={1} minWidth={0}>
        <Text fs="p6" color={getToken("text.low")}>
          {t("bankV3.deposit.receive")}
        </Text>
        <Flex gap="base" align="center">
          <Flex
            size={pxToRem(30)}
            sx={{ flexShrink: 0 }}
            borderRadius="full"
            align="center"
            justify="center"
            bg={getToken("surfaces.containers.high.primary")}
          >
            <Icon component={LandmarkIcon} size="m" />
          </Flex>
          <Stack minWidth={0}>
            <Text fs="p4" fw={600} wordBreak="break-word">
              {t("common:currency", {
                value: quote.received,
                symbol: quote.currency,
              })}
            </Text>
            <Text
              fs="p6"
              color={getToken("text.medium")}
              wordBreak="break-word"
            >
              {bankAccount}
            </Text>
          </Stack>
        </Flex>
      </Stack>
    </Flex>
  )
}
