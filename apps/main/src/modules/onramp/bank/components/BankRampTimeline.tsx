import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { getLitStages, RAMP_STAGES } from "@/modules/onramp/bank/utils/cashOut"

const STAGE_KEYS = [
  "bank.cashOut.stage.0",
  "bank.cashOut.stage.1",
  "bank.cashOut.stage.2",
  "bank.cashOut.stage.3",
  "bank.cashOut.stage.4",
] as const

type BankRampTimelineProps = {
  status: string
}

/**
 * API doc 5.5: a visual only, never words of its own beyond the stage names;
 * an off-timeline status lights nothing (the label says what happened).
 */
export const BankRampTimeline: FC<BankRampTimelineProps> = ({ status }) => {
  const { t } = useTranslation(["onramp"])
  const lit = getLitStages(status)
  if (lit === 0) return null
  return (
    <Flex gap="s" justify="space-between" aria-hidden>
      {RAMP_STAGES.map((stage, i) => (
        <Text
          key={stage}
          fs="p6"
          data-stage={stage}
          data-lit={i < lit ? "1" : "0"}
          color={getToken(i < lit ? "text.high" : "text.low")}
        >
          {t(STAGE_KEYS[i]!)}
        </Text>
      ))}
    </Flex>
  )
}
