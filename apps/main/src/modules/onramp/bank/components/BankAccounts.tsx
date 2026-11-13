import {
  Alert,
  Button,
  ModalBody,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankAccountForm } from "@/modules/onramp/bank/components/BankAccountForm"
import { BankAccountRow } from "@/modules/onramp/bank/components/BankAccountRow"
import { BankCashOut } from "@/modules/onramp/bank/components/BankCashOut"
import {
  useHbrBankAccounts,
  useHbrRemoveBankAccount,
} from "@/modules/onramp/bank/hooks/useHbr"
import { classifyRemoveBankAccount } from "@/modules/onramp/bank/utils/bankAccounts"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"

type BankAccountsProps = {
  h160: string
  rails: { usd: boolean; eur: boolean }
}

/** Bank accounts for cash-out: list, add, remove (API doc 4), then the cash-out itself. */
export const BankAccounts: FC<BankAccountsProps> = ({ h160, rails }) => {
  const { t } = useTranslation(["onramp"])
  const [adding, setAdding] = useState(false)
  const list = useHbrBankAccounts(h160)
  const remove = useHbrRemoveBankAccount(h160)

  const removeView = remove.isSuccess
    ? classifyRemoveBankAccount({ status: remove.data.status })
    : remove.isError
      ? classifyRemoveBankAccount({ error: remove.error })
      : null

  return (
    <ModalBody>
      <Stack gap="l">
        <Stack gap="s">
          <Text fs="p2" fw={500} font="primary">
            {t("bank.accounts.title")}
          </Text>
          <Text fs="p4" color={getToken("text.medium")}>
            {t("bank.accounts.description")}
          </Text>
        </Stack>
        {adding ? (
          <BankAccountForm
            h160={h160}
            rails={rails}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <>
            {list.isError && (
              <Alert
                variant="warning"
                description={t(`bank.error.${classifyBankError(list.error)}`)}
              />
            )}
            {list.data && list.data.bankAccounts.length === 0 && (
              <Text fs="p4" color={getToken("text.low")}>
                {t("bank.accounts.empty")}
              </Text>
            )}
            {list.data?.bankAccounts.map((account) => (
              <BankAccountRow
                key={account.id}
                account={account}
                isRemoving={remove.isPending}
                onRemove={() => remove.mutate(account.id)}
              />
            ))}
            {removeView && (
              <Alert
                variant={removeView === "removed" ? "success" : "info"}
                description={t(`bank.accounts.removeResult.${removeView}`)}
              />
            )}
            {/* With an account listed, adding another is a secondary action:
                the cash-out below stays the screen's primary action. */}
            {(list.data?.bankAccounts.length ?? 0) > 0 ? (
              <Button
                size="medium"
                variant="secondary"
                onClick={() => setAdding(true)}
              >
                {t("bank.accounts.addAnother")}
              </Button>
            ) : (
              <Button size="large" onClick={() => setAdding(true)}>
                {t("bank.accounts.add")}
              </Button>
            )}
            <BankCashOut h160={h160} accounts={list.data?.bankAccounts ?? []} />
          </>
        )}
      </Stack>
    </ModalBody>
  )
}
