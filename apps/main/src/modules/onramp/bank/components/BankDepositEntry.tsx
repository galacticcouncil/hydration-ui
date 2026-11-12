import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import type { DepositsResponse } from "@/modules/onramp/bank/config/schemas"
import {
  formatUsdcBaseUnits,
  getDepositDetailKey,
  getDepositSentAmount,
} from "@/modules/onramp/bank/utils/onramp"

type Entry =
  | DepositsResponse["deposits"][number]
  | DepositsResponse["unattributed"][number]

type BankDepositEntryProps = {
  entry: Entry
}

const usdc = (value: string) => formatUsdcBaseUnits(value) ?? "-"

/**
 * One deposit or unattributed entry. The label is the server's, verbatim
 * (API doc 5.3); `detail` is a code we write copy for; `progress` is shown
 * as exact USDC (rule 8). No Bridge state or other raw provider field is shown.
 */
export const BankDepositEntry: FC<BankDepositEntryProps> = ({ entry }) => {
  const { t } = useTranslation(["onramp"])
  const isDeposit = "id" in entry
  const sent = isDeposit ? getDepositSentAmount(entry) : null
  const detailKey = getDepositDetailKey(entry.detail)
  const { progress } = entry

  return (
    <Stack gap="xs" py="s">
      <Flex justify="space-between" align="center">
        <Text fs="p4" fw={500}>
          {entry.label}
        </Text>
        <Text fs="p5" color={getToken("text.low")}>
          {isDeposit
            ? entry.receivedAt
              ? t("bank.history.receivedAt", {
                  value: new Date(entry.receivedAt),
                })
              : t("bank.history.datePending")
            : t("bank.history.unattributedDate")}
        </Text>
      </Flex>
      {sent && (
        <Text fs="p5" color={getToken("text.medium")}>
          {t("bank.history.sentUsd", { amount: sent })}
        </Text>
      )}
      <Text fs="p5" color={getToken("text.medium")}>
        {t("bank.history.progress", {
          deposited: usdc(progress.deposited),
          arrived: usdc(progress.arrived),
          waiting: usdc(progress.waiting),
          credited: usdc(progress.credited),
        })}
      </Text>
      {entry.status === "waiting_deposit_limit" && (
        <Text fs="p5" color={getToken("text.medium")}>
          {t("bank.history.waitingLimit")}
        </Text>
      )}
      {detailKey && (
        <Text fs="p5" color={getToken("text.medium")}>
          {t(`bank.history.detail.${detailKey}`)}
        </Text>
      )}
    </Stack>
  )
}
