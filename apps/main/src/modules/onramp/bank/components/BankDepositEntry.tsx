import {
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
  TextButton,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankStatusPill } from "@/modules/onramp/bank/components/BankStatusPill"
import type { DepositsResponse } from "@/modules/onramp/bank/config/schemas"
import {
  formatUsdcBaseUnits,
  getDepositAmountLine,
  getDepositDetailKey,
  getDepositTone,
} from "@/modules/onramp/bank/utils/onramp"

type Entry =
  | DepositsResponse["deposits"][number]
  | DepositsResponse["unattributed"][number]

type BankDepositEntryProps = {
  entry: Entry
  /** Opens the deposit's timeline (deposits only, never an unattributed entry). */
  onOpen?: (id: string) => void
}

const usdc = (value: string) => formatUsdcBaseUnits(value) ?? "-"

/**
 * One deposit or unattributed entry, as a Figma M05 history card. The pill is
 * the server's label, verbatim (API doc 5.3), coloured per status; `detail`
 * is a code we write copy for; `progress` is exact USDC (rule 8). A EUR
 * deposit shows USDC only (rule 17). No Bridge state or other raw provider
 * field is shown.
 */
export const BankDepositEntry: FC<BankDepositEntryProps> = ({
  entry,
  onOpen,
}) => {
  const { t } = useTranslation(["onramp"])
  const isDeposit = "id" in entry
  const amountLine = isDeposit ? getDepositAmountLine(entry) : null
  const detailKey = getDepositDetailKey(entry.detail)
  const { progress } = entry

  return (
    <Paper p="l" data-deposit-row={isDeposit ? entry.id : "unattributed"}>
      <Stack gap="s">
        <Flex justify="space-between" align="center" gap="m">
          <Text fs="p2" fw={500} color={getToken("text.high")}>
            {amountLine
              ? t("bank.history.amountUsd", { amount: amountLine.amount })
              : t("bank.history.amountUsdc", {
                  amount: usdc(progress.arrived),
                })}
          </Text>
          <BankStatusPill
            label={entry.label}
            tone={getDepositTone(entry.status)}
          />
        </Flex>
        <Text fs="p5" color={getToken("text.low")}>
          {isDeposit
            ? entry.receivedAt
              ? t("bank.history.receivedAt", {
                  value: new Date(entry.receivedAt),
                })
              : t("bank.history.datePending")
            : t("bank.history.unattributedDate")}
        </Text>
        {amountLine && (
          <Text fs="p5" color={getToken("text.medium")}>
            {amountLine.received
              ? t("bank.history.receivedUsd", { amount: amountLine.amount })
              : t("bank.history.transferUsd", { amount: amountLine.amount })}
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
        {isDeposit && onOpen && (
          <>
            <Separator />
            <Flex justify="center">
              <TextButton onClick={() => onOpen(entry.id)}>
                {t("bank.history.open")}
              </TextButton>
            </Flex>
          </>
        )}
      </Stack>
    </Paper>
  )
}
