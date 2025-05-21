import { SubScan } from "@galacticcouncil/ui/assets/icons"
import { ExternalLink, Flex, Icon } from "@galacticcouncil/ui/components"
import { Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  TransactionStatus,
  TransactionStatusMessage,
} from "@/components/TransactionItem/TransactionStatus"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"

type StatusProps =
  | {
      readonly status: TransactionStatusVariant.Pending
    }
  | {
      readonly status: TransactionStatusVariant.Success
      readonly sent: string
      readonly received: string
    }
  | {
      readonly status: TransactionStatusVariant.Warning
    }

type Props = StatusProps & {
  readonly timestamp: string | null
  readonly message?: string
  readonly link?: string
  readonly className?: string
}

export const TransactionItemMobile: FC<Props> = ({
  timestamp,
  message,
  link,
  className,
  ...statusProps
}) => {
  const { t } = useTranslation()

  const [sent, received] =
    statusProps.status === TransactionStatusVariant.Success
      ? [statusProps.sent, statusProps.received]
      : [null, null]

  return (
    <Flex
      width="100%"
      justify="space-between"
      p={getTokenPx("containers.paddings.secondary")}
      className={className}
    >
      <Flex direction="column" gap={getTokenPx("containers.paddings.senary")}>
        <Text fw={500} fs={13} lh={1} color={getToken("text.high")}>
          {sent ?? "⎯"}
        </Text>
        {timestamp && (
          <Text fw={500} fs="p6" lh={1.4} color={getToken("text.low")}>
            {t("date.datetime", { value: new Date(timestamp) })}
          </Text>
        )}
      </Flex>
      <Flex align="center" gap={getTokenPx("containers.paddings.primary")}>
        <Flex
          direction="column"
          align="end"
          gap={getTokenPx("containers.paddings.quint")}
        >
          <Text fw={500} fs={13} lh={1} color={getToken("text.high")}>
            {received ?? "⎯"}
          </Text>
          <TransactionStatus variant={statusProps.status} />
          {message && (
            <TransactionStatusMessage
              variant={statusProps.status}
              sx={{ maxWidth: "200px", textAlign: "end" }}
            >
              {message}
            </TransactionStatusMessage>
          )}
        </Flex>
        {link && (
          <ExternalLink href={link}>
            <Icon size={14} component={SubScan} color="#FEFEFE" />
          </ExternalLink>
        )}
      </Flex>
    </Flex>
  )
}
