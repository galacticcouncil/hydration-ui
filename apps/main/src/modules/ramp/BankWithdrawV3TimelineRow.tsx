import { CheckIcon } from "@galacticcouncil/ui/assets/icons"
import { Box, Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  SBankTimelineMarker,
  SBankTimelineRow,
} from "./BankDepositV3Timeline.styled"
import { getBankWithdrawV3Timeline } from "./BankWithdrawV3Timeline.utils"

type BankWithdrawV3TimelineRowProps = {
  stage: ReturnType<typeof getBankWithdrawV3Timeline>["remaining"][number]
  last?: boolean
}

export const BankWithdrawV3TimelineRow: FC<BankWithdrawV3TimelineRowProps> = ({
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
          {t(`bankV3.withdraw.stage.${stage.key}`)}
        </Text>
        {stage.state !== "pending" && (
          <Text fs="p4" color={getToken("text.medium")}>
            {t(`bankV3.withdraw.stageDescription.${stage.key}`)}
          </Text>
        )}
      </Stack>
    </SBankTimelineRow>
  )
}
