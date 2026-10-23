import errorStatus from "@galacticcouncil/ui/assets/images/ErrorStatusPlain.webp"
import review3D from "@galacticcouncil/ui/assets/images/Review3D.webp"
import successStatus from "@galacticcouncil/ui/assets/images/SuccessStatusPlain.webp"
import warningStatus from "@galacticcouncil/ui/assets/images/WarningStatusPlain.webp"
import {
  Button,
  Collapsible,
  Image,
  Select,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositStatusChip } from "./BankDepositStatusChip"
import {
  BankProviderHandoffState,
  getBankProviderHandoffAction,
} from "./BankProviderHandoff.utils"
import { RailStatus } from "./deposit.mock"

type BankProviderHandoffProps = {
  state: BankProviderHandoffState
  status: RailStatus
  verified: boolean
  previewResponse: RailStatus
  onPreviewResponseChange: (status: RailStatus) => void
  onPreviewApproval: () => void
}

const responses = [
  "available",
  "in review",
  "more info needed",
  "rejected",
  "not offered in region",
] as const

export const BankProviderHandoff: FC<BankProviderHandoffProps> = ({
  state,
  status,
  verified,
  previewResponse,
  onPreviewResponseChange,
  onPreviewApproval,
}) => {
  const { t } = useTranslation("onramp")
  const action = getBankProviderHandoffAction({ state, status, verified })
  const view =
    action === "return"
      ? "away"
      : action === "continue"
        ? "ready"
        : action === "check"
          ? "review"
          : action === "blocked"
            ? "unavailable"
            : status === "more info needed"
              ? "moreInfo"
              : "intro"
  return (
    <Stack gap="l" data-bank-provider-handoff={view}>
      <Stack gap="m" align="center" py="l" role="status" aria-live="polite">
        <Image
          src={
            view === "ready"
              ? successStatus
              : view === "unavailable"
                ? errorStatus
                : view === "moreInfo"
                  ? warningStatus
                  : review3D
          }
          alt=""
          aria-hidden
          lazy={false}
          sx={{ size: "3xl", objectFit: "contain" }}
        />
        <Text as="h2" font="primary" fs="h7" fw={500} align="center">
          {t(`bankProvider.title.${view}`)}
        </Text>
        <Text fs="p5" align="center" color={getToken("text.medium")}>
          {t(`bankProvider.description.${view}`)}
        </Text>
        {view !== "intro" && view !== "away" && (
          <BankDepositStatusChip status={status} size="large" />
        )}
        {view === "review" && (
          <Button variant="tertiary" size="small" onClick={onPreviewApproval}>
            {t("bankProvider.previewApproval")}
          </Button>
        )}
      </Stack>
      {view !== "ready" && (
        <Text fs="p6" align="center" color={getToken("text.medium")}>
          {t("bankProvider.previewHandoff")}
        </Text>
      )}
      <Collapsible
        label={t("bankProvider.previewResponse")}
        actionLabel={t("bankV2.details.show")}
        actionLabelWhenOpen={t("bankV2.details.hide")}
      >
        <Stack gap="m" pt="m">
          <Text fs="p6" color={getToken("text.medium")}>
            {t("bankProvider.previewResponseDescription")}
          </Text>
          <Select<RailStatus>
            fullWidth
            value={previewResponse}
            aria-label={t("bankProvider.previewResponse")}
            onValueChange={onPreviewResponseChange}
            items={responses.map((value) => ({
              key: value,
              label: t(`bankProvider.result.${value}`),
            }))}
          />
        </Stack>
      </Collapsible>
    </Stack>
  )
}
