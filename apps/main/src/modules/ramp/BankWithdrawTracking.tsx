import {
  Alert,
  Button,
  Flex,
  Separator,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankTransferStatusIllustration } from "./BankTransferStatusIllustration"
import {
  BankWithdrawalQuote,
  getDemoWithdrawalBank,
  WithdrawalStatus,
} from "./BankWithdraw.utils"
import { BankWithdrawProgress } from "./BankWithdrawProgress"
import { BankWithdrawStatusChip } from "./BankWithdrawStatusChip"

type BankWithdrawTrackingProps = {
  quote: BankWithdrawalQuote
  bankAccount?: string
  status: WithdrawalStatus
  onStatusChange: (status: WithdrawalStatus) => void
}
const statuses: WithdrawalStatus[] = [
  "pending",
  "processing",
  "completed",
  "returned",
]

export const BankWithdrawTracking: FC<BankWithdrawTrackingProps> = ({
  quote,
  bankAccount,
  status,
  onStatusChange,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  return (
    <Stack gap="l">
      <Flex direction="column" gap="m" align="center">
        <BankTransferStatusIllustration
          status={
            status === "completed"
              ? "bank"
              : status === "returned"
                ? "warning"
                : "waiting"
          }
        />
        <BankWithdrawStatusChip status={status} />
        <Text fs="h7" font="primary">
          {t("common:currency", {
            value: quote.received,
            symbol: quote.currency,
          })}
        </Text>
        <Text fs="p5" color={getToken("text.medium")}>
          {t("bankWithdraw.tracking.example")}
        </Text>
      </Flex>
      <Alert
        variant={status === "returned" ? "warning" : "info"}
        description={t(`bankWithdraw.tracking.${status}`)}
      />
      <BankWithdrawProgress status={status} onStatusChange={onStatusChange} />
      <Summary
        rows={[
          {
            label: t("bankWithdraw.review.sell"),
            content: t("common:currency", {
              value: quote.amount,
              symbol: "HOLLAR",
            }),
          },
          {
            label: t("bankWithdraw.review.bank"),
            content: (
              <Text
                fs="p5"
                fw={500}
                lh={1.2}
                align="right"
                sx={{ overflowWrap: "anywhere" }}
                data-bank-account-value
              >
                {bankAccount ?? getDemoWithdrawalBank(quote.currency).account}
              </Text>
            ),
          },
          {
            label: t("bankWithdraw.review.rail"),
            content: t(`bankWithdraw.rail.${quote.currency}`),
          },
        ]}
      />
      <Separator />
      <Text fs="p5" fw={600}>
        {t("bankWithdraw.tracking.explore")}
      </Text>
      <Flex gap="s" wrap>
        {statuses.map((value) => (
          <Button
            key={value}
            size="small"
            variant={value === status ? "accent" : "muted"}
            aria-pressed={value === status}
            onClick={() => onStatusChange(value)}
          >
            {t(`bankWithdraw.status.${value}`)}
          </Button>
        ))}
      </Flex>
    </Stack>
  )
}
