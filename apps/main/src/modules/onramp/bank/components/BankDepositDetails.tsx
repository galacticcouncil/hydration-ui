import {
  Alert,
  Button,
  ModalBody,
  ModalFooter,
  Paper,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankStatusPill } from "@/modules/onramp/bank/components/BankStatusPill"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import { BankTimeline } from "@/modules/onramp/bank/components/BankTimeline"
import { useHbrDeposits } from "@/modules/onramp/bank/hooks/useHbr"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"
import {
  DEPOSIT_TIMELINE,
  formatUsdcBaseUnits,
  getDepositAmountLine,
  getDepositDetailKey,
  getDepositStage,
  getDepositTone,
} from "@/modules/onramp/bank/utils/onramp"

type BankDepositDetailsProps = {
  h160: string
  id: string
  onBack: () => void
}

const STAGE_NAMES = DEPOSIT_TIMELINE.map((stage) => stage.name)
const usdc = (value: string) => formatUsdcBaseUnits(value) ?? "-"

/**
 * One deposit (Figma D08-D13, opened in place of the list): the bank transfer,
 * then the P04 timeline lit only as far as the server's status reaches, with
 * the server's label as the current stage. An off-timeline status (Checking,
 * Needs attention, Returned, a later one) shows its label and detail alone.
 * Read from the same polled list as the history; nothing is kept.
 */
export const BankDepositDetails: FC<BankDepositDetailsProps> = ({
  h160,
  id,
  onBack,
}) => {
  const { t } = useTranslation(["onramp"])
  const deposits = useHbrDeposits(h160)
  const entry = deposits.data?.deposits.find((d) => d.id === id)

  const body = () => {
    if (!entry) {
      if (deposits.isError)
        return (
          <Alert
            variant="warning"
            description={t(`bank.error.${classifyBankError(deposits.error)}`)}
          />
        )
      if (!deposits.data) return <Skeleton height={160} />
      return <Alert variant="info" description={t("bank.deposit.notListed")} />
    }
    const amountLine = getDepositAmountLine(entry)
    const stage = getDepositStage(entry.status)
    const detailKey = getDepositDetailKey(entry.detail)
    const detail =
      entry.status === "waiting_deposit_limit"
        ? t("bank.history.waitingLimit")
        : detailKey
          ? t(`bank.history.detail.${detailKey}`)
          : null
    const { progress } = entry

    return (
      <Stack gap="l">
        <Paper p="l" bg="dim">
          <Stack gap="xs" align="center">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("bank.deposit.summary.bankTransfer")}
            </Text>
            <Text font="primary" fs="h6" color={getToken("text.high")}>
              {amountLine
                ? t("bank.history.amountUsd", { amount: amountLine.amount })
                : t("bank.history.amountUsdc", {
                    amount: usdc(progress.arrived),
                  })}
            </Text>
            <Text fs="p5" color={getToken("text.low")}>
              {entry.receivedAt
                ? t("bank.history.receivedAt", {
                    value: new Date(entry.receivedAt),
                  })
                : t("bank.history.datePending")}
            </Text>
          </Stack>
        </Paper>
        {stage.lit > 0 ? (
          <BankTimeline
            stages={STAGE_NAMES}
            lit={stage.lit}
            complete={stage.complete}
            current={{ label: entry.label, detail }}
          />
        ) : (
          <Stack gap="s" align="start" data-off-timeline={entry.status}>
            <BankStatusPill
              label={entry.label}
              tone={getDepositTone(entry.status)}
            />
            {detail && (
              <Text fs="p5" color={getToken("text.medium")}>
                {detail}
              </Text>
            )}
          </Stack>
        )}
        <Text fs="p5" color={getToken("text.medium")}>
          {t("bank.history.progress", {
            deposited: usdc(progress.deposited),
            arrived: usdc(progress.arrived),
            waiting: usdc(progress.waiting),
            credited: usdc(progress.credited),
          })}
        </Text>
      </Stack>
    )
  }

  return (
    <BankStepShell
      title={t("bank.deposit.transferTitle")}
      step="transfer"
      onBack={onBack}
    >
      <ModalBody>{body()}</ModalBody>
      <ModalFooter>
        <Button size="large" width="100%" onClick={onBack}>
          {t("bank.deposit.viewDeposits")}
        </Button>
      </ModalFooter>
    </BankStepShell>
  )
}
