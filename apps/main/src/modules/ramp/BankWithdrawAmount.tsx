import { Stack } from "@galacticcouncil/ui/components"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

import { BankAmountInput } from "./BankAmountInput"
import {
  getBankWithdrawalAmountError,
  getBankWithdrawalQuote,
  WithdrawalCurrency,
} from "./BankWithdraw.utils"
import { BankWithdrawReceiveAmount } from "./BankWithdrawReceiveAmount"

type BankWithdrawAmountProps = {
  amount: string
  currency: WithdrawalCurrency
  onAmountChange: (amount: string) => void
  onCurrencyChange: (currency: WithdrawalCurrency) => void
}

export const BankWithdrawAmount: FC<BankWithdrawAmountProps> = ({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const error = getBankWithdrawalAmountError(amount, currency)
  const quote = getBankWithdrawalQuote(amount, currency)
  return (
    <Stack gap="l">
      <BankAmountInput
        label={t("bankWithdraw.amount.label")}
        asset={{
          symbol: "HOLLAR",
          icon: <AssetLogo id={HOLLAR_ASSET_ID} size="medium" />,
        }}
        value={amount}
        onChange={onAmountChange}
        amountError={
          amount && error ? t(`bankWithdraw.amount.error.${error}`) : undefined
        }
      />
      <BankWithdrawReceiveAmount
        quote={quote}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
      />
    </Stack>
  )
}
