import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankStatusPill } from "@/modules/onramp/bank/components/BankStatusPill"
import type { RampView } from "@/modules/onramp/bank/config/schemas"
import { useCashOutLocalSend } from "@/modules/onramp/bank/hooks/useCashOutLocalSend"
import { showsLocalChecking } from "@/modules/onramp/bank/utils/cashOut"

type LabelledRamp = Pick<
  RampView,
  "id" | "status" | "label" | "tone" | "detail"
>

/**
 * The text a ramp shows: the server's label, tone and detail verbatim (rule
 * 2), except the one local label of rule 11: "Checking - do not send again"
 * while the server says `built` and this tab's redeem may have been sent.
 * Display only: no action.
 */
export const useRampLabel = (h160: string, ramp: LabelledRamp) => {
  const { t } = useTranslation(["onramp"])
  const local = useCashOutLocalSend(h160, ramp.id)
  const isLocal = showsLocalChecking(ramp, local.view)
  return {
    label: isLocal ? t("bank.cashOut.localChecking.label") : ramp.label,
    detail: isLocal ? t("bank.cashOut.localChecking.detail") : ramp.detail,
    tone: isLocal ? ("pending" as const) : ramp.tone,
  }
}

type BankRampLabelProps = {
  h160: string
  ramp: LabelledRamp
}

/** The ramp's status as a pill (server tone) with its detail under it. */
export const BankRampLabel: FC<BankRampLabelProps> = ({ h160, ramp }) => {
  const { label, detail, tone } = useRampLabel(h160, ramp)
  return (
    <Stack gap="xs" align="start" data-ramp-label={ramp.id}>
      <BankStatusPill label={label} tone={tone} />
      {detail && (
        <Text fs="p5" color={getToken("text.medium")}>
          {detail}
        </Text>
      )}
    </Stack>
  )
}
