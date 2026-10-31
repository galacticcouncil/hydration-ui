import {
  Alert,
  Button,
  Chip,
  Collapsible,
  Flex,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { getBankDepositProgress } from "./BankDepositProgress.utils"
import { BankDepositStatusChip } from "./BankDepositStatusChip"
import { BankTransferStatusIllustration } from "./BankTransferStatusIllustration"
import { DepositCurrency, DepositStatus } from "./deposit.mock"

type BankDepositSimplifiedTrackingProps = {
  amount: string
  currency: DepositCurrency
  status?: DepositStatus
  onStatusChange?: (status: DepositStatus) => void
}

export const BankDepositSimplifiedTracking: FC<
  BankDepositSimplifiedTrackingProps
> = ({ amount, currency, status, onStatusChange }) => {
  const { t } = useTranslation(["onramp", "common"])
  const completed = status === "Credited"
  const returned = status === "Returned"
  const queued =
    status === "Waiting for deposit limit" || status === "Queued on Hydration"
  const progress = getBankDepositProgress(status)
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
        <Text as="h2" font="primary" fs="h7" fw={500} align="center">
          {t(
            `bankSimplified.deposit.status.${returned ? "returned" : completed ? "credited" : queued ? "queued" : !status ? "awaiting" : "processing"}`,
          )}
        </Text>
        <Text font="primary" fs={["h6", "h5"]}>
          {t("common:currency", { value: amount, symbol: currency })}
        </Text>
        {status ? (
          <BankDepositStatusChip status={status} />
        ) : (
          <Chip variant="blue" rounded>
            {t("bankV2.deposit.tracking.awaiting")}
          </Chip>
        )}
        <Text fs="p5" align="center" color={getToken("text.medium")}>
          {t(
            returned
              ? "bankSimplified.deposit.returnedDescription"
              : `bankV2.deposit.tracking.${completed ? "creditedDescription" : !status ? "awaitingDescription" : "processingDescription"}`,
          )}
        </Text>
      </Stack>
      {progress.length > 0 && (
        <Summary
          rows={progress.map(({ key, state }) => ({
            label: t(`bankSimplified.deposit.stage.${key}`),
            content: t(`bankSimplified.progress.${state}`),
          }))}
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
