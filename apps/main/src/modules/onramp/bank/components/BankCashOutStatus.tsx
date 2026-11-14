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

import {
  BankRampLabel,
  useRampLabel,
} from "@/modules/onramp/bank/components/BankRampLabel"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import { BankTimeline } from "@/modules/onramp/bank/components/BankTimeline"
import type { RampView } from "@/modules/onramp/bank/config/schemas"
import { useCashOutLocalSend } from "@/modules/onramp/bank/hooks/useCashOutLocalSend"
import { useHbrRamp } from "@/modules/onramp/bank/hooks/useHbr"
import { getLitStages } from "@/modules/onramp/bank/utils/cashOut"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

const STAGE_KEYS = [
  "bank.cashOut.stage.0",
  "bank.cashOut.stage.1",
  "bank.cashOut.stage.2",
  "bank.cashOut.stage.3",
  "bank.cashOut.stage.4",
] as const

type BankCashOutStatusProps = {
  h160: string
  rampId: string
  /** The bank account's line, when the account is still listed. */
  accountLine?: (bankAccountId: string) => string | null
  onViewTransfers: () => void
}

const Progress: FC<{ h160: string; view: RampView }> = ({ h160, view }) => {
  const { t } = useTranslation(["onramp"])
  const text = useRampLabel(h160, view)
  const lit = getLitStages(view.status)
  // API doc 5.5: a status off the table lights nothing; its label says it.
  if (lit === 0) return <BankRampLabel h160={h160} ramp={view} />
  return (
    <BankTimeline
      stages={STAGE_KEYS.map((key) => t(key))}
      lit={lit}
      complete={view.status === "paid"}
      current={{ label: text.label, detail: text.detail }}
    />
  )
}

/**
 * One cash-out (Figma W10-W15, and R01 when reopened from Portfolio), polled
 * while shown (GET /v1/ramps/:id). The text is the server's (or the rule-11
 * local "Checking" while it says `built`); the timeline is the 5.5 visual.
 * It replaces the list, never sits above it, and offers no action on the
 * ramp and no way to start a cash-out from it (a ramp in Checking must not
 * read as "try again"): only back to the list of withdrawals.
 */
export const BankCashOutStatus: FC<BankCashOutStatusProps> = ({
  h160,
  rampId,
  accountLine,
  onViewTransfers,
}) => {
  const { t } = useTranslation(["onramp"])
  const ramp = useHbrRamp(h160, rampId)
  const local = useCashOutLocalSend(h160, rampId)
  const view = ramp.data?.ramp
  const line = view ? accountLine?.(view.bankAccountId) : null

  return (
    <BankStepShell
      title={t("bank.cashOut.status.title")}
      step="transfer"
      onBack={onViewTransfers}
    >
      <ModalBody>
        <Stack gap="l" data-cash-out-status={rampId}>
          {ramp.isError && (
            <Alert
              variant="warning"
              description={t(`bank.error.${classifyBankError(ramp.error)}`)}
            />
          )}
          {!view && !ramp.isError && <Skeleton height={160} />}
          {view && (
            <>
              <Paper p="l" bg="dim">
                <Stack gap="xs" align="center">
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("bank.cashOut.status.cashOut")}
                  </Text>
                  <Text font="primary" fs="h6" color={getToken("text.high")}>
                    {t("bank.cashOut.status.amount", {
                      amount: formatUsdcBaseUnits(view.usdcAmount) ?? "-",
                    })}
                  </Text>
                  {line && (
                    <Text fs="p5" color={getToken("text.low")}>
                      {line}
                    </Text>
                  )}
                </Stack>
              </Paper>
              <Progress h160={h160} view={view} />
              {view.status === "built" && local.view !== "none" && (
                <Text fs="p5" color={getToken("text.medium")}>
                  {t(`bank.cashOut.local.${local.view}`, {
                    value: new Date(view.validUntil),
                  })}
                </Text>
              )}
            </>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button size="large" width="100%" onClick={onViewTransfers}>
          {t("bank.cashOut.status.viewTransfers")}
        </Button>
      </ModalFooter>
    </BankStepShell>
  )
}
