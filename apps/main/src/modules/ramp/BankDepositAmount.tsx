import { FiatEur, FiatUsd } from "@galacticcouncil/ui/assets/icons"
import { Select } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankAmountInput } from "./BankAmountInput"
import { getBankDepositAmountError } from "./BankDepositV2.utils"
import { DepositCurrency } from "./deposit.mock"

type BankDepositAmountProps = {
  amount: string
  currency: DepositCurrency
  onAmountChange: (amount: string) => void
  onCurrencyChange: (currency: DepositCurrency) => void
}

export const BankDepositAmount: FC<BankDepositAmountProps> = ({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
}) => {
  const { t } = useTranslation("onramp")
  const error = getBankDepositAmountError(amount, currency)

  return (
    <BankAmountInput
      isFirstSection
      label={t("bankV2.deposit.amount")}
      assetSelector={
        <Select<DepositCurrency>
          aria-label={t("bankV2.deposit.currency.label")}
          value={currency}
          onValueChange={onCurrencyChange}
          variant="secondary"
          outline
          size="medium"
          iconSize={24}
          items={[
            {
              key: "USD",
              label: t("bankV2.deposit.rail.USD"),
              icon: FiatUsd,
            },
            {
              key: "EUR",
              label: t("bankV2.deposit.rail.EUR"),
              icon: FiatEur,
            },
          ]}
        />
      }
      value={amount}
      onChange={onAmountChange}
      amountError={
        amount && error ? t(`bankV2.deposit.error.${error}`) : undefined
      }
    />
  )
}
