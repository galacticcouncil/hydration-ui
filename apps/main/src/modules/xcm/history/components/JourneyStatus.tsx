import { Flex, Icon, Text, TextProps } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  getStatusProps,
  TJourneyStatus,
} from "@/modules/xcm/history/utils/journey"

export type JourneyStatusProps = TextProps & {
  status: TJourneyStatus
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
    <Flex align="center" gap="s" color={getToken(color)}>
      {icon && <Icon component={icon} size="s" />}
      <Text fw={500} lh={1} {...props}>
        {statusLabels[status]}
      </Text>
    </Flex>
  )
}
