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
import { BankWithdrawProgress } from "./BankWithdrawProgress"
import { BankWithdrawStatusChip } from "./BankWithdrawStatusChip"

type BankWithdrawV2TrackingProps = {
  quote: BankWithdrawalQuote
  settlement: string
  bankAccount: string
  status: WithdrawalStatus
  onStatusChange: (status: WithdrawalStatus) => void
}

export const BankWithdrawV2Tracking: FC<BankWithdrawV2TrackingProps> = ({
  quote,
  settlement,
  bankAccount,
  status,
  onStatusChange,
}) => {
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
      <BankWithdrawProgress status={status} onStatusChange={onStatusChange} />
      <Collapsible
        label={t("bankV2.withdraw.tracking.details")}
        actionLabel={t("bankV2.withdraw.details.show")}
        actionLabelWhenOpen={t("bankV2.withdraw.details.hide")}
      >
        <Summary
          rows={[
            {
              label: t("bankV2.withdraw.review.settlement"),
              content: t("common:currency", {
                value: settlement,
                symbol: "USDC",
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
