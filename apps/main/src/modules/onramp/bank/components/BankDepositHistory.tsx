import { Alert, Separator, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositEntry } from "@/modules/onramp/bank/components/BankDepositEntry"
import { useHbrDeposits } from "@/modules/onramp/bank/hooks/useHbr"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"

type BankDepositHistoryProps = {
  h160: string
}

/** GET /v1/onramp/deposits. Unattributed entries are listed apart, never as a deposit (rule 9). */
export const BankDepositHistory: FC<BankDepositHistoryProps> = ({ h160 }) => {
  const { t } = useTranslation(["onramp"])
  const deposits = useHbrDeposits(h160)
  const data = deposits.data

  return (
    <Stack gap="s">
      <Text fs="p3" fw={500}>
        {t("bank.history.title")}
      </Text>
      {deposits.isError && (
        <Alert
          variant="warning"
          description={t(`bank.error.${classifyBankError(deposits.error)}`)}
        />
      )}
      {data && data.deposits.length === 0 && data.unattributed.length === 0 && (
        <Text fs="p5" color={getToken("text.low")}>
          {t("bank.history.empty")}
        </Text>
      )}
      {data?.deposits.map((entry) => (
        <BankDepositEntry key={entry.id} entry={entry} />
      ))}
      {data && data.unattributed.length > 0 && (
        <>
          <Separator />
          <Text fs="p4" fw={500}>
            {t("bank.history.unattributed.title")}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("bank.history.unattributed.description")}
          </Text>
          {data.unattributed.map((entry, i) => (
            <BankDepositEntry
              key={entry.txHash ?? `opening-${i}`}
              entry={entry}
            />
          ))}
        </>
      )}
    </Stack>
  )
}
