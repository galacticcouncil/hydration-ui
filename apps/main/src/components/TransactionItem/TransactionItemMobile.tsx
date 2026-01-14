import { SubScan } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  ExternalLink,
  Flex,
  Icon,
} from "@galacticcouncil/ui/components"
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
      readonly status: TransactionStatusVariant.Success
      readonly sent: string
      readonly received: string
    }
  | {
      readonly status: Exclude<
        TransactionStatusVariant,
        TransactionStatusVariant.Success
      >
    }

type Props = StatusProps & {
  readonly timestamp: string | null
  readonly message?: string
  readonly link?: string | null
  readonly className?: string
  readonly errorTitle?: string
  readonly errorMessage?: string
}

export const TransactionItemMobile: FC<Props> = ({
  timestamp,
  message,
  link,
  className,
  errorTitle,
  errorMessage,
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
          <TransactionStatus
            variant={statusProps.status}
            errorTitle={errorTitle}
          />
          {(message || errorMessage) && (
            <TransactionStatusMessage
              variant={statusProps.status}
              sx={{ maxWidth: "200px", textAlign: "end" }}
            >
              {message || errorMessage}
            </TransactionStatusMessage>
          )}
        </Flex>
        {link && (
          <ButtonIcon asChild>
            <ExternalLink href={link}>
              <Icon size={14} component={SubScan} color="#FEFEFE" />
            </ExternalLink>
          </ButtonIcon>
        )}
      </Flex>
    </Flex>
  )
}
