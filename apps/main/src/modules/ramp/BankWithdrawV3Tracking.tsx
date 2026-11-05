import {
  CheckIcon,
  ChevronDown,
  ChevronUp,
} from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  ButtonTransparent,
  Collapsible,
  Flex,
  Icon,
  Select,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { SBankTimelineMarker } from "./BankDepositV3Timeline.styled"
import { BankTransferStatusIllustration } from "./BankTransferStatusIllustration"
import { BankWithdrawalQuote } from "./BankWithdraw.utils"
import { BankWithdrawV3Summary } from "./BankWithdrawV3Summary"
import { getBankWithdrawV3Timeline } from "./BankWithdrawV3Timeline.utils"
import {
  withdrawalV3Stages,
  WithdrawalV3Status,
} from "./BankWithdrawV3Timeline.utils"
import { BankWithdrawV3TimelineRow } from "./BankWithdrawV3TimelineRow"

type BankWithdrawV3TrackingProps = {
  quote: BankWithdrawalQuote
  bankAccount: string
  status: WithdrawalV3Status
  onStatusChange: (status: WithdrawalV3Status) => void
}

export const BankWithdrawV3Tracking: FC<BankWithdrawV3TrackingProps> = ({
  quote,
  bankAccount,
  status,
  onStatusChange,
}) => {
  const { t } = useTranslation("onramp")
  const [expanded, setExpanded] = useState(false)
  const checking = status === "checking"
  const expired = status === "expired"
  const { completed, remaining } = getBankWithdrawV3Timeline(status)
  const returned = status === "returned"
  const paid = status === "paid"
  const statuses: WithdrawalV3Status[] = [
    ...withdrawalV3Stages,
    "returned",
    "expired",
    "checking",
  ]
  return (
    <Stack gap="xl" data-bank-withdraw-v3-tracking>
      <BankWithdrawV3Summary quote={quote} bankAccount={bankAccount} />
      {checking || returned || expired ? (
        <Stack gap="m" align="center" role="status" aria-live="polite">
          <BankTransferStatusIllustration
            status={checking ? "waiting" : "warning"}
          />
          <Text as="h2" font="primary" fs="h7" align="center">
            {t(`bankV3.withdraw.stage.${status}`)}
          </Text>
          <Text fs="p4" align="center" color={getToken("text.medium")}>
            {t(`bankV3.withdraw.stageDescription.${status}`)}
          </Text>
        </Stack>
      ) : (
        <Stack aria-label={t("bankV3.withdraw.tracking")}>
          {completed.length > 0 && (
            <Collapsible
              open={expanded}
              onOpenChange={setExpanded}
              trigger={
                <ButtonTransparent sx={{ width: "100%", py: "m" }}>
                  <Flex width="100%" gap="m" align="center">
                    <SBankTimelineMarker state="confirmed" aria-hidden>
                      <Icon component={CheckIcon} size="s" />
                    </SBankTimelineMarker>
                    <Text fs="p4" fw={500} flex={1} align="left">
                      {t("bankV3.completedSteps", { count: completed.length })}
                    </Text>
                    <Icon
                      component={expanded ? ChevronUp : ChevronDown}
                      size="m"
                      color={getToken("text.low")}
                    />
                  </Flex>
                </ButtonTransparent>
              }
            >
              {completed.map((stage) => (
                <BankWithdrawV3TimelineRow key={stage.key} stage={stage} />
              ))}
            </Collapsible>
          )}
          {remaining.map((stage, index) => (
            <BankWithdrawV3TimelineRow
              key={stage.key}
              stage={stage}
              last={index === remaining.length - 1}
            />
          ))}
        </Stack>
      )}
      {!paid && !returned && !expired && !checking && (
        <Alert description={t("bankV3.withdraw.inProgress")} />
      )}
      <Collapsible
        label={t("bankV3.preview.label")}
        actionLabel={t("bankV2.details.show")}
        actionLabelWhenOpen={t("bankV2.details.hide")}
      >
        <Stack gap="m" pt="m">
          <Text fs="p6" color={getToken("text.medium")}>
            {t("bankV2.deposit.tracking.explore")}
          </Text>
          <Select<WithdrawalV3Status>
            fullWidth
            value={status}
            aria-label={t("bankV3.withdraw.previewStatus")}
            items={statuses.map((value) => ({
              key: value,
              label: t(`bankV3.withdraw.stage.${value}`),
            }))}
            onValueChange={onStatusChange}
          />
        </Stack>
      </Collapsible>
    </Stack>
  )
}
