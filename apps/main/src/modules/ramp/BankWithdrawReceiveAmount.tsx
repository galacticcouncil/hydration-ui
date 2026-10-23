import { FiatEur, FiatUsd } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Flex,
  Select,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankWithdrawalQuote, WithdrawalCurrency } from "./BankWithdraw.utils"

type BankWithdrawReceiveAmountProps = {
  quote: BankWithdrawalQuote | null
  currency: WithdrawalCurrency
  onCurrencyChange: (currency: WithdrawalCurrency) => void
}

export const BankWithdrawReceiveAmount: FC<BankWithdrawReceiveAmountProps> = ({
  quote,
  currency,
  onCurrencyChange,
}) => {
  const { t } = useTranslation(["onramp", "common"])

  return (
    <Stack gap="base" data-bank-receive-amount>
      <Flex align="center" justify="space-between" gap="base">
        <Text
          font="primary"
          fs="p3"
          fw={700}
          color={getToken("text.tint.secondary")}
        >
          {t("bankV2.withdraw.amount.receive")}
        </Text>
        <Text fs="p6" color={getToken("text.low")}>
          {t("bankV2.withdraw.amount.receiveDescription")}
        </Text>
      </Flex>
      <Flex
        align="center"
        justify="space-between"
        gap="m"
        p="m"
        borderRadius="m"
        bg={getToken("surfaces.containers.dim.dimOnHigh")}
      >
        <Select<WithdrawalCurrency>
          aria-label={t("bankV2.withdraw.currency.label")}
          value={currency}
          onValueChange={onCurrencyChange}
          variant="secondary"
          outline
          size="medium"
          iconSize={24}
          items={[
            {
              key: "USD",
              label: t("bankV2.withdraw.rail.USD"),
              icon: FiatUsd,
            },
            {
              key: "EUR",
              label: t("bankV2.withdraw.rail.EUR"),
              icon: FiatEur,
            },
          ]}
        />
        <Flex minWidth={0} justify="flex-end" sx={{ overflowWrap: "anywhere" }}>
          <Amount
            value={quote ? t("common:number", { value: quote.received }) : "—"}
            size="large"
          />
        </Flex>
      </Flex>
    </Stack>
  )
}
