import {
  Alert,
  LoadingButton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositInstructions } from "@/modules/onramp/bank/components/BankDepositInstructions"
import type {
  OnrampAccountsResponse,
  OnrampCurrency,
} from "@/modules/onramp/bank/config/schemas"
import {
  useHbrRequestOnrampAccount,
  useHbrRetryOnrampAccount,
} from "@/modules/onramp/bank/hooks/useHbr"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"
import {
  canRequestOnrampAccount,
  canRetryOnrampAccount,
  classifyOnrampError,
  findOnrampAccount,
  getVisibleInstructions,
  OnrampErrorView,
} from "@/modules/onramp/bank/utils/onramp"

type BankDepositAccountProps = {
  h160: string
  currency: OnrampCurrency
  query: { data: OnrampAccountsResponse | undefined; error: unknown }
}

const useErrorText = () => {
  const { t } = useTranslation(["onramp"])
  return (view: OnrampErrorView) =>
    view.kind === "railUnavailable"
      ? t("bank.deposit.error.railUnavailable", { gate: view.gate ?? "-" })
      : view.kind === "retryNotAllowed"
        ? t(
            `bank.deposit.error.retryNotAllowed.${
              view.reason === "rearm_budget_spent" ||
              view.reason === "rearm_too_soon" ||
              view.reason === "not_held"
                ? view.reason
                : "other"
            }`,
          )
        : t(`bank.deposit.error.${view.kind}`)
}

/**
 * One currency's on-ramp account (API doc 5.4). The status is a code with no
 * server label: the copy is ours per status, and an unknown status reads
 * "checking" with no action but the re-arm, which follows `retryAllowed`.
 */
export const BankDepositAccount: FC<BankDepositAccountProps> = ({
  h160,
  currency,
  query,
}) => {
  const { t } = useTranslation(["onramp"])
  const errorText = useErrorText()
  const request = useHbrRequestOnrampAccount(h160)
  const retry = useHbrRetryOnrampAccount(h160)
  const view = findOnrampAccount(query.data, currency)
  const visible = getVisibleInstructions(query, currency)

  return (
    <Stack gap="m">
      {query.error ? (
        <Alert
          variant="warning"
          description={t(`bank.error.${classifyBankError(query.error)}`)}
        />
      ) : null}
      {view && (
        <Stack gap="s">
          <Text fs="p3" fw={500}>
            {t(`bank.deposit.status.${view.status}.title`, {
              currency: t(`bank.deposit.currency.${currency}`),
            })}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {t(`bank.deposit.status.${view.status}.description`)}
          </Text>
        </Stack>
      )}
      {visible && (
        <BankDepositInstructions
          currency={currency}
          instructions={visible.instructions}
          minimumDeposit={visible.minimumDeposit}
        />
      )}
      {canRequestOnrampAccount(view) && (
        <LoadingButton
          size="large"
          isLoading={request.isPending}
          disabled={request.isPending}
          onClick={() => request.mutate(currency)}
        >
          {t("bank.deposit.request", {
            currency: t(`bank.deposit.currency.${currency}`),
          })}
        </LoadingButton>
      )}
      {request.isError && (
        <Alert
          variant="warning"
          description={errorText(classifyOnrampError(request.error))}
        />
      )}
      {canRetryOnrampAccount(view) && (
        <LoadingButton
          size="large"
          variant="secondary"
          isLoading={retry.isPending}
          disabled={retry.isPending}
          onClick={() => retry.mutate(currency)}
        >
          {t("bank.deposit.retry")}
        </LoadingButton>
      )}
      {retry.isError && (
        <Alert
          variant="warning"
          description={errorText(classifyOnrampError(retry.error))}
        />
      )}
    </Stack>
  )
}
