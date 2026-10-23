import {
  Alert,
  Button,
  Chip,
  Collapsible,
  Flex,
  Stack,
  Stepper,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankTransferStatusIllustration } from "./BankTransferStatusIllustration"
import { DepositCurrency, DepositStatus } from "./deposit.mock"

type BankDepositV2TrackingProps = {
  amount: string
  currency: DepositCurrency
  status?: DepositStatus
  onStatusChange?: (status: DepositStatus) => void
}

export const BankDepositV2Tracking: FC<BankDepositV2TrackingProps> = ({
  amount,
  currency,
  status,
  onStatusChange,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const completed = status === "Credited"
  const returned = status === "Returned"
  const queued =
    status === "Waiting for deposit limit" || status === "Queued on Hydration"
  const stage = !status ? 0 : status === "Received by Bridge" ? 1 : 2
  return (
    <Stack gap="l">
      <Stack gap="m" align="center" py="l">
        <BankTransferStatusIllustration
          status={
            completed
              ? "success"
              : returned || status === "Waiting for deposit limit"
                ? "warning"
                : "waiting"
          }
        />
        <Text font="primary" fs={["h6", "h5"]}>
          {t("common:currency", { value: amount, symbol: currency })}
        </Text>
        <Chip variant={returned ? "red" : completed ? "green" : "blue"} rounded>
          {t(
            `bankV2.deposit.tracking.${returned ? "returned" : completed ? "credited" : !status ? "awaiting" : "processing"}`,
          )}
        </Chip>
        <Text fs="p5" align="center" color={getToken("text.medium")}>
          {t(
            `bankV2.deposit.tracking.${returned ? "returnedDescription" : completed ? "creditedDescription" : !status ? "awaitingDescription" : "processingDescription"}`,
          )}
        </Text>
      </Stack>
      {!returned && (
        <Stepper
          compact
          steps={[
            t("bankV2.deposit.tracking.bank"),
            t("bankV2.deposit.tracking.received"),
            t("bankV2.deposit.tracking.wallet"),
          ]}
          activeStepIndex={completed ? 3 : stage}
        />
      )}
      {queued && <Alert description={t("bankV2.deposit.tracking.queued")} />}
      {status && (
        <Collapsible
          label={t("bankV2.deposit.tracking.details")}
          actionLabel={t("bankV2.details.show")}
          actionLabelWhenOpen={t("bankV2.details.hide")}
        >
          <Stack gap="m" pt="m">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("bankV2.deposit.tracking.observed", { status })}
            </Text>
            {onStatusChange && (
              <>
                <Text fs="p6" color={getToken("text.medium")}>
                  {t("bankV2.deposit.tracking.explore")}
                </Text>
                <Flex gap="s" wrap>
                  {(
                    [
                      "Received by Bridge",
                      "Waiting for deposit limit",
                      "Credited",
                      "Returned",
                    ] as const
                  ).map((value) => (
                    <Button
                      key={value}
                      size="small"
                      variant={value === status ? "secondary" : "muted"}
                      aria-pressed={value === status}
                      onClick={() => onStatusChange(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </Flex>
              </>
            )}
          </Stack>
        </Collapsible>
      )}
    </Stack>
  )
}
