import { Alert, Button, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankRampLabel } from "@/modules/onramp/bank/components/BankRampLabel"
import { BankRampTimeline } from "@/modules/onramp/bank/components/BankRampTimeline"
import { useCashOutLocalSend } from "@/modules/onramp/bank/hooks/useCashOutLocalSend"
import { useHbrRamp } from "@/modules/onramp/bank/hooks/useHbr"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

type BankCashOutStatusProps = {
  h160: string
  rampId: string
  onBack: () => void
}

/**
 * One cash-out, polled while shown (GET /v1/ramps/:id). The label is the
 * server's (or the rule-11 local "Checking" while it says `built`); this
 * screen offers no action on the ramp, only a way back.
 */
export const BankCashOutStatus: FC<BankCashOutStatusProps> = ({
  h160,
  rampId,
  onBack,
}) => {
  const { t } = useTranslation(["onramp"])
  const ramp = useHbrRamp(h160, rampId)
  const local = useCashOutLocalSend(h160, rampId)
  const view = ramp.data?.ramp

  return (
    <Stack gap="m" data-cash-out-status={rampId}>
      <Text fs="p2" fw={500} font="primary">
        {t("bank.cashOut.status.title")}
      </Text>
      {ramp.isError && (
        <Alert
          variant="warning"
          description={t(`bank.error.${classifyBankError(ramp.error)}`)}
        />
      )}
      {view && (
        <>
          <Text fs="p4" color={getToken("text.medium")}>
            {t("bank.cashOut.status.amount", {
              amount: formatUsdcBaseUnits(view.usdcAmount) ?? "-",
            })}
          </Text>
          <BankRampLabel h160={h160} ramp={view} />
          <BankRampTimeline status={view.status} />
          {view.status === "built" && local.view !== "none" && (
            <Text fs="p5" color={getToken("text.medium")}>
              {t(`bank.cashOut.local.${local.view}`, {
                value: new Date(view.validUntil),
              })}
            </Text>
          )}
        </>
      )}
      <Button variant="tertiary" onClick={onBack}>
        {t("bank.cashOut.status.back")}
      </Button>
    </Stack>
  )
}
