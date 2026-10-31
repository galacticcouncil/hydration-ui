import {
  CheckIcon,
  ChevronDown,
  ChevronUp,
} from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Button,
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

import { BankDepositV3Summary } from "./BankDepositV3Summary"
import { SBankTimelineMarker } from "./BankDepositV3Timeline.styled"
import { getBankDepositV3Timeline } from "./BankDepositV3Timeline.utils"
import { BankDepositV3TimelineRow } from "./BankDepositV3TimelineRow"
import { BankTransferStatusIllustration } from "./BankTransferStatusIllustration"
import { DepositCurrency, DepositStatus, depositSteps } from "./deposit.mock"

type BankDepositV3TrackingProps = {
  amount: string
  currency: DepositCurrency
  status: DepositStatus
  onStatusChange: (status: DepositStatus) => void
}

export const BankDepositV3Tracking: FC<BankDepositV3TrackingProps> = ({
  amount,
  currency,
  status,
  onStatusChange,
}) => {
  const { t } = useTranslation("onramp")
  const [expanded, setExpanded] = useState(false)
  const [checking, setChecking] = useState(false)
  const { completed, remaining } = getBankDepositV3Timeline(status)
  const returned = status === "Returned"
  const credited = status === "Credited"
  const statuses: DepositStatus[] = [
    ...depositSteps,
    "Waiting for deposit limit",
    "Returned",
  ]
  return (
    <Stack gap="xl" data-bank-v3-tracking>
      <BankDepositV3Summary amount={amount} currency={currency} />
      {checking || returned ? (
        <Stack gap="m" align="center" role="status" aria-live="polite">
          <BankTransferStatusIllustration
            status={returned && !checking ? "warning" : "waiting"}
          />
          <Text as="h2" font="primary" fs="h7" align="center">
            {t(
              checking
                ? "bankV3.deposit.checking"
                : "bankSimplified.deposit.status.returned",
            )}
          </Text>
          <Text fs="p4" align="center" color={getToken("text.medium")}>
            {t(
              checking
                ? "bankV3.deposit.checkingDescription"
                : "bankSimplified.deposit.returnedDescription",
            )}
          </Text>
        </Stack>
      ) : (
        <Stack aria-label={t("bankV2.deposit.tracking")}>
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
                <BankDepositV3TimelineRow key={stage.key} stage={stage} />
              ))}
            </Collapsible>
          )}
          {remaining.map((stage, index) => (
            <BankDepositV3TimelineRow
              key={stage.key}
              stage={stage}
              last={index === remaining.length - 1}
            />
          ))}
        </Stack>
      )}
      {!credited && !returned && !checking && (
        <Alert
          description={t(
            status === "Waiting for deposit limit"
              ? "bankV2.deposit.tracking.queued"
              : "bankV3.deposit.inProgress",
          )}
        />
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
          <Select<DepositStatus>
            fullWidth
            value={status}
            aria-label={t("bankCurrent.previewStatus")}
            items={statuses.map((value) => ({ key: value, label: value }))}
            onValueChange={(value) => {
              setChecking(false)
              onStatusChange(value)
            }}
          />
          <Button
            size="small"
            variant="tertiary"
            onClick={() => setChecking((value) => !value)}
          >
            {t(
              checking
                ? "bankV3.deposit.showStatus"
                : "bankV3.deposit.previewChecking",
            )}
          </Button>
        </Stack>
      </Collapsible>
    </Stack>
  )
}
