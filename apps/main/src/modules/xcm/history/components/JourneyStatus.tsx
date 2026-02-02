import {
  CheckIcon,
  ClockIcon,
  TriangleAlert,
} from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text, TextProps } from "@galacticcouncil/ui/components"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { XcJourney } from "@galacticcouncil/xc-scan"
import { useTranslation } from "react-i18next"

type TJourneyStatus = XcJourney["status"]

export type JourneyStatusProps = TextProps & {
  status: TJourneyStatus
}

const PENDING_STATUSES = ["sent", "pending", "waiting"]
const SUCCESS_STATUSES = ["received", "success", "completed", "confirmed"]
const FAILED_STATUSES = ["fail", "failed", "timeout"]

const getStatusProps = (
  status: TJourneyStatus,
): {
  color: ThemeToken
  icon: React.ComponentType | null
} => {
  if (PENDING_STATUSES.includes(status)) {
    return {
      color: "controls.solid.accent",
      icon: ClockIcon,
    }
  }
  if (SUCCESS_STATUSES.includes(status)) {
    return {
      color: "accents.success.emphasis",
      icon: CheckIcon,
    }
  }

  if (FAILED_STATUSES.includes(status)) {
    return {
      color: "accents.danger.secondary",
      icon: TriangleAlert,
    }
  }

  return {
    color: "text.medium",
    icon: null,
  }
}

export const JourneyStatus: React.FC<JourneyStatusProps> = ({
  status,
  ...props
}) => {
  const { t } = useTranslation(["xcm"])
  const statusLabels: Record<TJourneyStatus, string> = {
    sent: t("journey.status.sent"),
    pending: t("journey.status.pending"),
    received: t("journey.status.received"),
    success: t("journey.status.success"),
    completed: t("journey.status.completed"),
    confirmed: t("journey.status.confirmed"),
    waiting: t("journey.status.waiting"),
    fail: t("journey.status.fail"),
    failed: t("journey.status.failed"),
    timeout: t("journey.status.timeout"),
  }

  const { color, icon } = getStatusProps(status)

  return (
    <Flex align="center" gap="s" asChild>
      <Text fw={500} color={getToken(color)} {...props}>
        {icon && <Icon component={icon} size="s" />}
        {statusLabels[status]}
      </Text>
    </Flex>
  )
}
