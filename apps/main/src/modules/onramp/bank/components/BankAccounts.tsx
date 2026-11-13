import { ModalBody } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  BankAccountPicker,
  useBankAccountLine,
} from "@/modules/onramp/bank/components/BankAccountPicker"
import { BankAddAccount } from "@/modules/onramp/bank/components/BankAddAccount"
import { BankCashOut } from "@/modules/onramp/bank/components/BankCashOut"
import { BankCashOutAmount } from "@/modules/onramp/bank/components/BankCashOutAmount"
import { BankCashOutHistory } from "@/modules/onramp/bank/components/BankCashOutHistory"
import { BankCashOutStatus } from "@/modules/onramp/bank/components/BankCashOutStatus"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import type { BankAccountView } from "@/modules/onramp/bank/config/schemas"
import { useBankFlow } from "@/modules/onramp/bank/hooks/useBankFlow"
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

// The review is pinned to the account object captured at Continue (review 4a
// B4): a later list read that reorders or drops accounts never swaps the
// cash-out for another account's screen. A status is pinned to its ramp id.
type View =
  | { kind: "amount" }
  | { kind: "pick" }
  | { kind: "add" }
  | { kind: "review"; account: BankAccountView }
  | { kind: "status"; rampId: string }
  | { kind: "transfers" }

/**
 * The withdraw flow after set-up, as Figma W01-W15: the amount (W01), the
 * bank account (W02, or adding one: W03/W04), the review and the two wallet
 * steps (W05/W06, BankCashOut), then the cash-out's status (W10-W15) and the
 * list of cash-outs, each opening in place of the list (R01).
 */
export const BankAccounts: FC<BankAccountsProps> = ({ h160, rails }) => {
  const { t } = useTranslation(["onramp"])
  const { entry } = useBankFlow()
  const [view, setView] = useState<View>(
    entry?.kind === "ramp"
      ? { kind: "status", rampId: entry.id }
      : { kind: "amount" },
  )
  const [usdcAmount, setUsdcAmount] = useState("")
  const [chosenId, setChosenId] = useState<string | undefined>()
  const list = useHbrBankAccounts(h160)
  const remove = useHbrRemoveBankAccount(h160)
  const line = useBankAccountLine()
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
  const accountLine = (id: string) => {
    const account = accounts.find((a) => a.id === id)
    return account ? line(account) : null
  }

  switch (view.kind) {
    case "add":
      return (
        <BankAddAccount
          h160={h160}
          rails={rails}
          onDone={() => setView({ kind: "pick" })}
          onBack={() => setView({ kind: "pick" })}
        />
      )
    case "review":
      return (
        <BankCashOut
          key={`${view.account.id}-${usdcAmount}`}
          h160={h160}
          account={view.account}
          usdcAmount={usdcAmount}
          onBack={() => setView({ kind: "pick" })}
          onStatus={(rampId) => setView({ kind: "status", rampId })}
        />
      )
    case "status":
      return (
        <BankCashOutStatus
          key={view.rampId}
          h160={h160}
          rampId={view.rampId}
          accountLine={accountLine}
          onViewTransfers={() => setView({ kind: "transfers" })}
        />
      )
    case "transfers":
      return (
        <BankStepShell
          title={t("bank.cashOut.history.title")}
          step="transfer"
          onBack={() => setView({ kind: "amount" })}
        >
          <ModalBody>
            <BankCashOutHistory
              hideTitle
              h160={h160}
              onOpen={(rampId) => setView({ kind: "status", rampId })}
            />
          </ModalBody>
        </BankStepShell>
      )
    case "pick":
      return (
        <BankStepShell
          title={t("bank.accounts.title")}
          description={t("bank.accounts.description")}
          step="bankAccount"
          onBack={() => setView({ kind: "amount" })}
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
              // Reached from W01's destination row before an amount was
              // entered: back to W01 with this account; no quote without one.
              if (!usdcAmount) setView({ kind: "amount" })
              else setView({ kind: "review", account: selected })
            }}
          />
        </BankStepShell>
      )
    case "amount":
      break
  }

  return (
    <BankCashOutAmount
      usdcAmount={usdcAmount}
      accountLine={selected ? line(selected) : null}
      onChooseAccount={() => setView({ kind: "pick" })}
      onContinue={(amount) => {
        setUsdcAmount(amount)
        setView({ kind: "pick" })
      }}
      onViewTransfers={() => setView({ kind: "transfers" })}
    />
  )
}
