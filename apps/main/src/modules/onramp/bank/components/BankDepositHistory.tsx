import { Alert, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositEntry } from "@/modules/onramp/bank/components/BankDepositEntry"
import { useHbrDeposits } from "@/modules/onramp/bank/hooks/useHbr"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"
import {
  getTransferGroup,
  matchesTransferFilter,
  TransferFilter,
} from "@/modules/onramp/bank/utils/onramp"

type BankDepositHistoryProps = {
  h160: string
  /** Opens one deposit's timeline in place of this list. */
  onOpen?: (id: string) => void
  /** The flow's list step already titles the list: no repeated heading. */
  hideTitle?: boolean
  /** Portfolio's chip; unattributed entries show under All only. */
  filter?: TransferFilter
}

/**
 * GET /v1/onramp/deposits as Figma M05 cards. Unattributed entries are listed
 * apart, never as a deposit (rule 9). An empty answer is "no deposits tracked
 * yet", not proof that nothing was sent (API doc 4).
 */
export const BankDepositHistory: FC<BankDepositHistoryProps> = ({
  h160,
  onOpen,
  filter = "all",
  hideTitle = false,
}) => {
  const { t } = useTranslation(["onramp"])
  const deposits = useHbrDeposits(h160)
  const data = deposits.data

  return (
    <Stack gap="m">
      {!hideTitle && (
        <Text fs="p3" fw={500}>
          {t("bank.history.title")}
        </Text>
      )}
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
      {data?.deposits
        .filter((entry) =>
          matchesTransferFilter(
            filter,
            getTransferGroup({ kind: "deposit", status: entry.status }),
          ),
        )
        .map((entry) => (
          <BankDepositEntry key={entry.id} entry={entry} onOpen={onOpen} />
        ))}
      {data && filter === "all" && data.unattributed.length > 0 && (
        <Stack gap="s" data-unattributed="1">
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
        </Stack>
      )}
    </Stack>
  )
}
