import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import type { RampView } from "@/modules/onramp/bank/config/schemas"
import { useCashOutLocalSend } from "@/modules/onramp/bank/hooks/useCashOutLocalSend"
import { showsLocalChecking } from "@/modules/onramp/bank/utils/cashOut"

const TONE_COLOR = {
  pending: "text.medium",
  attention: "accents.alert.primary",
  neutral: "text.medium",
  success: "accents.success.emphasis",
  unknown: "text.medium",
} as const

type BankRampLabelProps = {
  h160: string
  ramp: Pick<RampView, "id" | "status" | "label" | "tone" | "detail">
}

/**
 * The server's label, tone and detail verbatim (rule 2), except the one local
 * label of rule 11: "Checking - do not send again" while the server says
 * `built` and this tab's redeem may have been sent. Display only: no action.
 */
export const BankRampLabel: FC<BankRampLabelProps> = ({ h160, ramp }) => {
  const { t } = useTranslation(["onramp"])
  const local = useCashOutLocalSend(h160, ramp.id)
  const isLocal = showsLocalChecking(ramp, local.view)
  const label = isLocal ? t("bank.cashOut.localChecking.label") : ramp.label
  const detail = isLocal ? t("bank.cashOut.localChecking.detail") : ramp.detail
  const tone = isLocal ? "pending" : ramp.tone

  return (
    <Stack gap="xs" data-ramp-label={ramp.id}>
      <Text fs="p4" fw={500} color={getToken(TONE_COLOR[tone])}>
        {label}
      </Text>
      {detail && (
        <Text fs="p5" color={getToken("text.medium")}>
          {detail}
        </Text>
      )}
    </Stack>
  )
}
