import { CheckIcon } from "@galacticcouncil/ui/assets/icons"
import { Box, Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { getBankDepositProgress } from "./BankDepositProgress.utils"
import {
  SBankTimelineMarker,
  SBankTimelineRow,
} from "./BankDepositV3Timeline.styled"

type BankDepositV3TimelineRowProps = {
  stage: ReturnType<typeof getBankDepositProgress>[number]
  last?: boolean
}

export const BankDepositV3TimelineRow: FC<BankDepositV3TimelineRowProps> = ({
  stage,
  last = false,
}) => {
  const { t } = useTranslation("onramp")
  return (
    <SBankTimelineRow
      confirmed={stage.state === "confirmed"}
      last={last}
      aria-current={stage.state === "current" ? "step" : undefined}
      data-bank-timeline-stage={stage.key}
    >
      <SBankTimelineMarker state={stage.state} aria-hidden>
        {stage.state === "confirmed" ? (
          <Icon component={CheckIcon} size="s" />
        ) : stage.state === "current" ? (
          <Box size={pxToRem(8)} borderRadius="full" bg="currentColor" />
        ) : null}
      </SBankTimelineMarker>
      <Stack gap="s" flex={1} minWidth={0}>
        <Text
          fs="p4"
          fw={500}
          color={getToken(stage.state === "pending" ? "text.low" : "text.high")}
        >
          {t(`bankSimplified.deposit.stage.${stage.key}`)}
        </Text>
        {stage.state !== "pending" && (
          <Text fs="p4" color={getToken("text.medium")}>
            {t(`bankV3.deposit.stageDescription.${stage.key}`)}
          </Text>
        )}
      </Stack>
    </SBankTimelineRow>
  )
}
