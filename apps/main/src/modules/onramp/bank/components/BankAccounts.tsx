import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankAccountPicker } from "@/modules/onramp/bank/components/BankAccountPicker"
import { BankAddAccount } from "@/modules/onramp/bank/components/BankAddAccount"
import { BankCashOut } from "@/modules/onramp/bank/components/BankCashOut"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import type { BankAccountView } from "@/modules/onramp/bank/config/schemas"
import {
  useHbrBankAccounts,
  useHbrRemoveBankAccount,
} from "@/modules/onramp/bank/hooks/useHbr"
import { classifyRemoveBankAccount } from "@/modules/onramp/bank/utils/bankAccounts"
import { getCashOutAccounts } from "@/modules/onramp/bank/utils/cashOut"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"

type BankAccountsProps = {
  h160: string
  rails: { usd: boolean; eur: boolean }
}

// The cash-out is pinned to the account object captured at Continue: a later
// list read that reorders or drops accounts never swaps the cash-out (or the
// status of a ramp in flight) for another account's screen.
type View =
  | { kind: "pick" }
  | { kind: "add" }
  | { kind: "cashOut"; account: BankAccountView }

/**
 * The withdraw flow after set-up: choose a saved bank account (Figma W02) or
 * add one (W03/W04), then the cash-out for that account (API doc 4).
 */
export const BankAccounts: FC<BankAccountsProps> = ({ h160, rails }) => {
  const { t } = useTranslation(["onramp"])
  const [view, setView] = useState<View>({ kind: "pick" })
  const [chosenId, setChosenId] = useState<string | undefined>()
  const list = useHbrBankAccounts(h160)
  const remove = useHbrRemoveBankAccount(h160)
  const accounts = list.data?.bankAccounts ?? []
  const usable = getCashOutAccounts(accounts)
  // The pick follows the live list: a chosen account that left it is dropped.
  const selected =
    usable.find((a) => a.id === chosenId) ?? (chosenId ? undefined : usable[0])

  const removeView = remove.isSuccess
    ? classifyRemoveBankAccount({ status: remove.data.status })
    : remove.isError
      ? classifyRemoveBankAccount({ error: remove.error })
      : null
  const notices = [
    ...(list.isError
      ? [
          {
            variant: "warning" as const,
            text: t(`bank.error.${classifyBankError(list.error)}`),
          },
        ]
      : []),
    ...(removeView
      ? [
          {
            variant:
              removeView === "removed"
                ? ("success" as const)
                : ("info" as const),
            text: t(`bank.accounts.removeResult.${removeView}`),
          },
        ]
      : []),
  ]

  if (view.kind === "add")
    return (
      <BankAddAccount
        h160={h160}
        rails={rails}
        onDone={() => setView({ kind: "pick" })}
        onBack={() => setView({ kind: "pick" })}
      />
    )

  if (view.kind === "cashOut")
    return (
      <BankCashOut
        key={view.account.id}
        h160={h160}
        account={view.account}
        onBack={() => setView({ kind: "pick" })}
      />
    )

  return (
    <BankStepShell
      title={t("bank.accounts.title")}
      description={t("bank.accounts.description")}
      step="bankAccount"
    >
      <BankAccountPicker
        accounts={accounts}
        selectedId={selected?.id}
        onSelect={setChosenId}
        onAdd={() => setView({ kind: "add" })}
        onRemove={(id) => remove.mutate(id)}
        isRemoving={remove.isPending}
        notices={notices}
        onContinue={() => {
          if (!selected) return
          setChosenId(selected.id)
          setView({ kind: "cashOut", account: selected })
        }}
      />
    </BankStepShell>
  )
}
