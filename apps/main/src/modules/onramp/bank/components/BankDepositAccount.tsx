import { ClockIcon, LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Button,
  LoadingButton,
  ModalBody,
  ModalFooter,
  Stack,
} from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositInstructions } from "@/modules/onramp/bank/components/BankDepositInstructions"
import { BankDepositPreparing } from "@/modules/onramp/bank/components/BankDepositPreparing"
import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import type {
  OnrampAccountsResponse,
  OnrampCurrency,
} from "@/modules/onramp/bank/config/schemas"
import {
  useHbrActionInFlight,
  useHbrRequestOnrampAccount,
  useHbrRetryOnrampAccount,
} from "@/modules/onramp/bank/hooks/useHbr"
import { classifyBankError } from "@/modules/onramp/bank/utils/onboarding"
import {
  canRequestOnrampAccount,
  canRetryOnrampAccount,
  classifyOnrampError,
  findOnrampAccount,
  getOnrampHeader,
  getVisibleInstructions,
  OnrampErrorView,
} from "@/modules/onramp/bank/utils/onramp"

type BankDepositAccountProps = {
  h160: string
  currency: OnrampCurrency
  query: { data: OnrampAccountsResponse | undefined; error: unknown }
  /** Above the screen's content: the currency choice. */
  top?: ReactNode
  /** The footer's "View deposits" (the Transfer step). */
  onViewDeposits: () => void
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
 * Figma: `ready` is D06 (the details as rows); every other status is the P01
 * centred message with only the action its rule allows.
 */
export const BankDepositAccount: FC<BankDepositAccountProps> = ({
  h160,
  currency,
  query,
  top,
  onViewDeposits,
}) => {
  const { t } = useTranslation(["onramp"])
  const errorText = useErrorText()
  const request = useHbrRequestOnrampAccount(h160)
  const retry = useHbrRetryOnrampAccount(h160)
  // Per currency, from the mutation cache: survives the tab remount.
  const requestInFlight = useHbrActionInFlight(
    h160,
    "requestOnrampAccount",
    currency,
  )
  const retryInFlight = useHbrActionInFlight(
    h160,
    "retryOnrampAccount",
    currency,
  )
  const view = findOnrampAccount(query.data, currency)
  const visible = getVisibleInstructions(query, currency)
  const header = getOnrampHeader(query, currency)
  const currencyName = t(`bank.deposit.currency.${currency}`)

  const alerts = (
    <>
      {header?.kind === "failed" && (
        <Alert
          variant="warning"
          description={t(`bank.error.${classifyBankError(query.error)}`)}
        />
      )}
      {request.isError && (
        <Alert
          variant="warning"
          description={errorText(classifyOnrampError(request.error))}
        />
      )}
      {retry.isError && (
        <Alert
          variant="warning"
          description={errorText(classifyOnrampError(retry.error))}
        />
      )}
    </>
  )
  const actions = (
    <>
      {canRequestOnrampAccount(view) && (
        <LoadingButton
          size="large"
          isLoading={requestInFlight.pending}
          disabled={requestInFlight.pending}
          onClick={() => {
            if (requestInFlight.isFree()) request.mutate(currency)
          }}
        >
          {t("bank.deposit.request", { currency: currencyName })}
        </LoadingButton>
      )}
      {canRetryOnrampAccount(view) && (
        <LoadingButton
          size="large"
          variant="secondary"
          isLoading={retryInFlight.pending}
          disabled={retryInFlight.pending}
          onClick={() => {
            if (retryInFlight.isFree()) retry.mutate(currency)
          }}
        >
          {t("bank.deposit.retry")}
        </LoadingButton>
      )}
    </>
  )

  if (visible)
    return (
      <>
        <ModalBody>
          <Stack gap="l">
            {top}
            <BankDepositInstructions
              wallet={h160}
              currency={currency}
              instructions={visible.instructions}
              minimumDeposit={visible.minimumDeposit}
            />
            {alerts}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Stack gap="m" width="100%">
            {actions}
            <Button size="large" onClick={onViewDeposits}>
              {t("bank.deposit.viewDeposits")}
            </Button>
          </Stack>
        </ModalFooter>
      </>
    )

  // After a failed read the last status is not restated (rule 5: its
  // instructions are hidden too); the title says the read failed. A 429 is a
  // backoff (getOnrampHeader), not a failure.
  const title =
    header?.kind === "failed"
      ? t("bank.deposit.readFailed", { currency: currencyName })
      : header?.kind === "rechecking"
        ? t("bank.deposit.rechecking", { currency: currencyName })
        : header?.kind === "status"
          ? t(`bank.deposit.status.${header.view.status}.title`, {
              currency: currencyName,
            })
          : t("bank.deposit.loading", { currency: currencyName })
  const status = header?.kind === "status" ? header.view.status : null
  const description =
    status && status !== "preparing"
      ? t(`bank.deposit.status.${status}.description`)
      : undefined

  return (
    <BankMessage
      icon={status === "ready" ? LandmarkIcon : ClockIcon}
      title={title}
      description={description}
      actions={
        <>
          {actions}
          <Button size="large" variant="tertiary" onClick={onViewDeposits}>
            {t("bank.deposit.viewDeposits")}
          </Button>
        </>
      }
    >
      {top}
      {status === "preparing" && <BankDepositPreparing />}
      {alerts}
    </BankMessage>
  )
}
