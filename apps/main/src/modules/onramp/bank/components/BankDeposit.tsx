import {
  ModalBody,
  Separator,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositAccount } from "@/modules/onramp/bank/components/BankDepositAccount"
import { BankDepositHistory } from "@/modules/onramp/bank/components/BankDepositHistory"
import type { OnrampCurrency } from "@/modules/onramp/bank/config/schemas"
import { useHbrOnrampAccounts } from "@/modules/onramp/bank/hooks/useHbr"

type BankDepositProps = {
  h160: string
}

/** Bank deposit: one on-ramp account per currency, then the deposit history. */
export const BankDeposit: FC<BankDepositProps> = ({ h160 }) => {
  const { t } = useTranslation(["onramp"])
  const [currency, setCurrency] = useState<OnrampCurrency>("usd")
  const accounts = useHbrOnrampAccounts(h160)

  return (
    <ModalBody>
      <Stack gap="l">
        <ToggleGroup<OnrampCurrency>
          type="single"
          fullWidth
          value={currency}
          onValueChange={(value) => value && setCurrency(value)}
        >
          <ToggleGroupItem value="usd">
            {t("bank.deposit.currency.usd")}
          </ToggleGroupItem>
          <ToggleGroupItem value="eur">
            {t("bank.deposit.currency.eur")}
          </ToggleGroupItem>
        </ToggleGroup>
        <BankDepositAccount
          key={currency}
          h160={h160}
          currency={currency}
          query={{ data: accounts.data, error: accounts.error }}
        />
        <Separator />
        <BankDepositHistory h160={h160} />
      </Stack>
    </ModalBody>
  )
}
