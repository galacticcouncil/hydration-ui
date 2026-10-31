import {
  Alert,
  Button,
  Collapsible,
  Flex,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

import { BankTransferStatusIllustration } from "./BankTransferStatusIllustration"
import { BankWithdrawalQuote, WithdrawalStatus } from "./BankWithdraw.utils"
import { BankWithdrawStatusChip } from "./BankWithdrawStatusChip"

type BankWithdrawSimplifiedTrackingProps = {
  quote: BankWithdrawalQuote
  bankAccount: string
  status: WithdrawalStatus
  onStatusChange: (status: WithdrawalStatus) => void
}

export const BankWithdrawSimplifiedTracking: FC<
  BankWithdrawSimplifiedTrackingProps
> = ({ quote, bankAccount, status, onStatusChange }) => {
  const { t } = useTranslation(["onramp", "common"])
  return (
    <Stack gap={["l", "xl"]}>
      <Stack gap="m" align="center" py={["m", "l"]}>
        <BankTransferStatusIllustration
          status={
            status === "completed"
              ? "bank"
              : status === "returned"
                ? "warning"
                : "waiting"
          }
        />
        <Text as="h2" font="primary" fs="h7" fw={500} align="center">
          {t(`bankSimplified.withdraw.status.${status}`)}
        </Text>
        <BankWithdrawStatusChip status={status} />
        <Flex gap="m" align="center">
          <AssetLogo id={HOLLAR_ASSET_ID} size="medium" />
          <Text font="primary" fs={["h6", "h5"]}>
            {t("common:currency", { value: quote.amount, symbol: "HOLLAR" })}
          </Text>
        </Flex>
        <Text fs="p6" color={getToken("text.medium")}>
          {t("bankV2.withdraw.tracking.example")}
        </Text>
      </Stack>
      <Alert
        variant={status === "returned" ? "warning" : "info"}
        description={
          <Text fs="p5" lh={1.4}>
            {t(`bankV2.withdraw.tracking.${status}`)}
          </Text>
        }
      />
      {status !== "returned" && (
        <Summary
          rows={(["pending", "processing", "completed"] as const).map(
            (value, index) => ({
              label: t(`bankSimplified.withdraw.stage.${value}`),
              content: t(
                `bankSimplified.progress.${status === "completed" || index < (status === "processing" ? 1 : 0) ? "confirmed" : status === value ? "current" : "pending"}`,
              ),
            }),
          )}
        />
      )}
      <Collapsible
        label={t("bankV2.withdraw.tracking.details")}
        actionLabel={t("bankV2.withdraw.details.show")}
        actionLabelWhenOpen={t("bankV2.withdraw.details.hide")}
      >
        <Summary
          rows={[
            {
              label: t("bankV2.withdraw.amount.receive"),
              content: t("common:currency", {
                value: quote.received,
                symbol: quote.currency,
              }),
            },
            {
              label: t("bankV2.withdraw.review.bank"),
              content: (
                <Text
                  fs="p5"
                  fw={500}
                  lh={1.2}
                  align="right"
                  sx={{ overflowWrap: "anywhere" }}
                  data-bank-account-value
                >
                  {bankAccount}
                </Text>
              ),
            },
            {
              label: t("bankV2.withdraw.review.currency"),
              content: quote.currency,
            },
          ]}
        />
      </Collapsible>
      <Collapsible
        label={t("bankV2.withdraw.tracking.explore")}
        actionLabel={t("bankV2.withdraw.details.show")}
        actionLabelWhenOpen={t("bankV2.withdraw.details.hide")}
      >
        <Flex gap="s" wrap pt="m">
          <Button
            size="small"
            variant="tertiary"
            onClick={() =>
              onStatusChange(status === "pending" ? "processing" : "completed")
            }
            disabled={status === "completed" || status === "returned"}
          >
            {t("bankV2.withdraw.tracking.next")}
          </Button>
          <Button
            size="small"
            variant="tertiary"
            disabled={status === "returned"}
            onClick={() => onStatusChange("returned")}
          >
            {t("bankV2.withdraw.tracking.returnPreview")}
          </Button>
        </Flex>
      </Collapsible>
    </Stack>
  )
}
