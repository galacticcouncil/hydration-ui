import {
  Alert,
  Button,
  ModalBody,
  ModalFooter,
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
import { BankWithdrawalReceipt } from "@/modules/onramp/bank/components/BankWithdrawalReceipt"
import type { RampView } from "@/modules/onramp/bank/config/schemas"
import { useCashOutLocalSend } from "@/modules/onramp/bank/hooks/useCashOutLocalSend"
import { useHbrRamp, useHbrService } from "@/modules/onramp/bank/hooks/useHbr"
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
 * read as "try again"): only back to the list of withdrawals. On the fixture
 * service (`service.mode === "fixture"`, invariant 3) every ramp is a
 * demonstration, and the screen says so first (invariant 4).
 */
export const BankCashOutStatus: FC<BankCashOutStatusProps> = ({
  h160,
  rampId,
  accountLine,
  onViewTransfers,
}) => {
  const { t } = useTranslation(["onramp"])
  const demo = useHbrService().mode === "fixture"
  const ramp = useHbrRamp(h160, rampId)
  const local = useCashOutLocalSend(h160, rampId)
  const view = ramp.data?.ramp
  const line = view ? accountLine?.(view.bankAccountId) : null

  const notices = (demo || ramp.isError) && (
    <>
      {demo && (
        <Alert variant="info" description={t("bank.cashOut.status.demoNote")} />
      )}
      {ramp.isError && (
        <Alert
          variant="warning"
          description={t(`bank.error.${classifyBankError(ramp.error)}`)}
        />
      )}
    </>
  )

  return (
    <BankStepShell
      title={t("bank.cashOut.status.title")}
      step="transfer"
      onBack={onViewTransfers}
    >
      {view ? (
        <BankWithdrawalReceipt
          statusId={rampId}
          label={t("bank.cashOut.status.cashOut")}
          amount={t("bank.cashOut.status.amount", {
            amount: formatUsdcBaseUnits(view.usdcAmount) ?? "-",
          })}
          account={line}
          notice={notices}
        >
          <Progress h160={h160} view={view} />
          {view.status === "built" && local.view !== "none" && (
            <Text fs="p5" color={getToken("text.medium")}>
              {t(`bank.cashOut.local.${local.view}`, {
                value: new Date(view.validUntil),
              })}
            </Text>
          )}
        </BankWithdrawalReceipt>
      ) : (
        <ModalBody>
          <Stack gap="l" data-cash-out-status={rampId}>
            {notices}
            {!ramp.isError && <Skeleton height={160} />}
          </Stack>
        </ModalBody>
      )}
      <ModalFooter>
        <Button size="large" width="100%" onClick={onViewTransfers}>
          {t("bank.cashOut.status.viewTransfers")}
        </Button>
      </ModalFooter>
    </BankStepShell>
  )
}
