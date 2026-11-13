import {
  ModalBody,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositAccount } from "@/modules/onramp/bank/components/BankDepositAccount"
import { BankDepositDetails } from "@/modules/onramp/bank/components/BankDepositDetails"
import { BankDepositHistory } from "@/modules/onramp/bank/components/BankDepositHistory"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import type { OnrampCurrency } from "@/modules/onramp/bank/config/schemas"
import { useBankFlow } from "@/modules/onramp/bank/hooks/useBankFlow"
import { useHbrOnrampAccounts } from "@/modules/onramp/bank/hooks/useHbr"

type BankDepositProps = {
  h160: string
}

type View =
  | { kind: "details" }
  | { kind: "transfers" }
  | { kind: "deposit"; id: string }

type DetailsProps = {
  h160: string
  currency: OnrampCurrency
  onCurrency: (currency: OnrampCurrency) => void
  onViewDeposits: () => void
}

/**
 * D06: one currency's on-ramp account. The account read lives here only, so
 * it is dropped (gcTime 0) while another step of the flow is shown.
 */
const Details: FC<DetailsProps> = ({
  h160,
  currency,
  onCurrency,
  onViewDeposits,
}) => {
  const { t } = useTranslation(["onramp"])
  const accounts = useHbrOnrampAccounts(h160)
  return (
    <BankStepShell
      title={t("bank.deposit.detailsTitle", {
        currency: t(`bank.deposit.currency.${currency}`),
      })}
      step="bankDetails"
    >
      <BankDepositAccount
        key={currency}
        h160={h160}
        currency={currency}
        query={{ data: accounts.data, error: accounts.error }}
        onViewDeposits={onViewDeposits}
        top={
          <ToggleGroup<OnrampCurrency>
            type="single"
            fullWidth
            value={currency}
            onValueChange={(value) => value && onCurrency(value)}
          >
            <ToggleGroupItem value="usd">
              {t("bank.deposit.currency.usd")}
            </ToggleGroupItem>
            <ToggleGroupItem value="eur">
              {t("bank.deposit.currency.eur")}
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
    </BankStepShell>
  )
}

/**
 * Bank deposit after set-up (Figma D06 -> D08-D13): the receiving details of
 * one currency, then the Transfer step with the deposits, and one deposit's
 * timeline in place of the list. HBR takes no deposit amount, so there is no
 * D02 step.
 */
export const BankDeposit: FC<BankDepositProps> = ({ h160 }) => {
  const { t } = useTranslation(["onramp"])
  const { entry } = useBankFlow()
  const [currency, setCurrency] = useState<OnrampCurrency>(
    entry?.kind === "bankDetails" ? entry.currency : "usd",
  )
  const [view, setView] = useState<View>(
    entry?.kind === "deposit"
      ? { kind: "deposit", id: entry.id }
      : { kind: "details" },
  )

  if (view.kind === "deposit")
    return (
      <BankDepositDetails
        h160={h160}
        id={view.id}
        onBack={() => setView({ kind: "transfers" })}
      />
    )

  if (view.kind === "transfers")
    return (
      <BankStepShell
        title={t("bank.deposit.transfersTitle")}
        step="transfer"
        onBack={() => setView({ kind: "details" })}
      >
        <ModalBody>
          <BankDepositHistory
            h160={h160}
            onOpen={(id) => setView({ kind: "deposit", id })}
          />
        </ModalBody>
      </BankStepShell>
    )

  return (
    <Details
      h160={h160}
      currency={currency}
      onCurrency={setCurrency}
      onViewDeposits={() => setView({ kind: "transfers" })}
    />
  )
}
