import { SubScan } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ButtonIcon,
  ExternalLink,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"
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
  readonly timestamp: Date | null
  readonly message?: string | null
  readonly link?: string | null
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
    <TransactionItemMobileContainer>
      <Flex justify="space-between" flex={1} p="l" className={className}>
        <Flex direction="column" gap="xs">
          <Text fw={500} fs="p4" lh={1} color={getToken("text.high")}>
            {sent ?? "⎯"}
          </Text>
          {timestamp && (
            <Text fw={500} fs="p6" lh={1.4} color={getToken("text.low")}>
              {t("date.datetime", { value: timestamp })}
            </Text>
          )}
        </Flex>

        <Flex direction="column" align="end" gap="s">
          <Text fw={500} fs="p4" lh={1} color={getToken("text.high")}>
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
      </Flex>
      <TransactionItemMobileAction>
        {link && (
          <ButtonIcon asChild>
            <ExternalLink href={link}>
              <Icon size="s" component={SubScan} color="#FEFEFE" />
            </ExternalLink>
          </ButtonIcon>
        )}
      </TransactionItemMobileAction>
    </TransactionItemMobileContainer>
  )
}

export const TransactionItemMobileContainer = ({
  children,
}: {
  readonly children: ReactNode
}) => {
  return (
    <Flex align="center" gap="xxl">
      {children}
    </Flex>
  )
}

export const TransactionItemMobileAction = ({
  children,
}: {
  readonly children?: ReactNode
}) => {
  return <Box size={34}>{children}</Box>
}
