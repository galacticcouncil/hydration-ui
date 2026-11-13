import {
  Alert,
  Button,
  FormField,
  Input,
  ModalBody,
  Stack,
} from "@galacticcouncil/ui/components"
import { FC, useEffect, useRef, useState } from "react"
import { Controller, FormProvider, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBankAccountLine } from "@/modules/onramp/bank/components/BankAccountPicker"
import {
  BankCashOutFormValues,
  useBankCashOutForm,
} from "@/modules/onramp/bank/components/BankCashOut.form"
import { BankCashOutHistory } from "@/modules/onramp/bank/components/BankCashOutHistory"
import { BankCashOutQuote } from "@/modules/onramp/bank/components/BankCashOutQuote"
import { BankCashOutReview } from "@/modules/onramp/bank/components/BankCashOutReview"
import { BankCashOutStatus } from "@/modules/onramp/bank/components/BankCashOutStatus"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import type {
  BankAccountView,
  RampBuildResponse,
} from "@/modules/onramp/bank/config/schemas"
import {
  useHbrBuildRamp,
  useHbrQuoteRamp,
  useHbrService,
} from "@/modules/onramp/bank/hooks/useHbr"
import { useBankCashOutStore } from "@/modules/onramp/bank/store/useBankCashOutStore"
import {
  CashOutErrorView,
  classifyCashOutError,
  PreparedCashOut,
  reportRedeemHash,
} from "@/modules/onramp/bank/utils/cashOut"
import { buildCashOutTransaction } from "@/modules/onramp/bank/utils/cashOutTransaction"
import { strictEvmDigest } from "@/modules/transactions/utils/strictEvm"
import { useTransactionsStore } from "@/states/transactions"

// The quote route allows 30 calls per 10 minutes per wallet: one each 20 s.
export const QUOTE_REFRESH_MS = 20_000

type Stage =
  | { kind: "form" }
  | {
      kind: "review"
      build: Omit<RampBuildResponse, "approveTx" | "redeemTx">
      currency: "usd" | "eur"
      hasApprove: boolean
      chainId: number
    }
  | { kind: "status"; rampId: string }

type BankCashOutProps = {
  h160: string
  /** The account chosen on the step before; a cash-out goes to it only. */
  account: BankAccountView
  onBack: () => void
}

const sameRequest = (
  a: BankCashOutFormValues | undefined,
  b: { bankAccountId?: string; usdcAmount?: unknown },
) =>
  !!a &&
  a.bankAccountId === b.bankAccountId &&
  a.usdcAmount === String(b.usdcAmount ?? "").trim()

/**
 * Cash out to a bank account (API doc 4: quote, build, report; rule 11). The
 * build's unsigned transactions live in `prepared` (a ref) only until they
 * are handed to createTransaction, once, as two strict steps; then the ref is
 * cleared and the screen shows the ramp's status.
 */
export const BankCashOut: FC<BankCashOutProps> = ({
  h160,
  account,
  onBack,
}) => {
  const { t } = useTranslation(["onramp"])
  const service = useHbrService()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const [stage, setStage] = useState<Stage>({ kind: "form" })
  const prepared = useRef<PreparedCashOut | null>(null)
  const [quotedAt, setQuotedAt] = useState(0)
  const [, setTick] = useState(0)

  const form = useBankCashOutForm(account.id)
  const values = useWatch({ control: form.control })
  const quote = useHbrQuoteRamp(h160)
  const build = useHbrBuildRamp(h160, (next) => {
    prepared.current = next
  })

  // The transactions never outlive this screen.
  useEffect(
    () => () => {
      prepared.current = null
    },
    [],
  )

  // Re-render when the quote may be refreshed again.
  useEffect(() => {
    if (!quotedAt) return
    const timer = setTimeout(
      () => setTick((n) => n + 1),
      Math.max(0, quotedAt + QUOTE_REFRESH_MS - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [quotedAt])

  const currency = account.currency === "eur" ? "eur" : "usd"
  const accountLine = useBankAccountLine()(account)

  const handOver = () => {
    if (stage.kind !== "review") return
    const next = prepared.current
    prepared.current = null
    if (!next || next.rampId !== stage.build.ramp.id) return
    const rampId = next.rampId
    useBankCashOutStore.getState().record(h160, rampId, {
      approveDigest: next.approveTx
        ? strictEvmDigest(next.approveTx, rampId)
        : null,
      redeemDigest: strictEvmDigest(next.redeemTx, rampId),
    })
    const input = buildCashOutTransaction({
      prepared: next,
      sessionAddress: h160,
      onRedeemHash: (txHash) => {
        const store = useBankCashOutStore.getState()
        store.update(h160, rampId, { redeemHash: txHash, report: "pending" })
        void reportRedeemHash({ service, h160, rampId, txHash }).then(
          (report) =>
            useBankCashOutStore.getState().update(h160, rampId, { report }),
        )
      },
      copy: {
        approveStep: t("bank.cashOut.tx.approveStep"),
        redeemStep: t("bank.cashOut.tx.redeemStep"),
        approveTitle: t("bank.cashOut.tx.approveTitle"),
        redeemTitle: t("bank.cashOut.tx.redeemTitle"),
        toasts: {
          submitted: t("bank.cashOut.tx.submitted"),
          success: t("bank.cashOut.tx.success"),
        },
      },
    })
    // The outcome is read from the strict ledger, not from this promise.
    void createTransaction(input).catch(() => undefined)
    setStage({ kind: "status", rampId })
  }

  const leaveTo = (rampId: string) => {
    prepared.current = null
    quote.reset()
    build.reset()
    setStage({ kind: "status", rampId })
  }

  const backToForm = () => {
    prepared.current = null
    quote.reset()
    build.reset()
    setStage({ kind: "form" })
  }

  if (stage.kind === "status")
    return (
      <BankStepShell
        title={t("bank.cashOut.title")}
        step="transfer"
        onBack={backToForm}
      >
        <ModalBody>
          <Stack gap="l">
            <BankCashOutStatus
              h160={h160}
              rampId={stage.rampId}
              onBack={backToForm}
            />
            <BankCashOutHistory h160={h160} onOpen={leaveTo} />
          </Stack>
        </ModalBody>
      </BankStepShell>
    )

  if (stage.kind === "review")
    return (
      <BankStepShell
        title={t("bank.cashOut.title")}
        step="review"
        onBack={() => leaveTo(stage.build.ramp.id)}
      >
        <ModalBody>
          <BankCashOutReview
            build={stage.build}
            currency={stage.currency}
            hasApprove={stage.hasApprove}
            chainId={stage.chainId}
            onSign={handOver}
            onLeave={() => leaveTo(stage.build.ramp.id)}
          />
        </ModalBody>
      </BankStepShell>
    )

  const quoteFits = quote.isSuccess && sameRequest(quote.variables, values)
  const quoteError = quote.isError
    ? classifyCashOutError(quote.error, "quote")
    : null
  const buildError = build.isError
    ? classifyCashOutError(build.error, "build")
    : null
  const notAvailable =
    quoteError?.kind === "notAvailable" || buildError?.kind === "notAvailable"
  const coolingDown = Date.now() < quotedAt + QUOTE_REFRESH_MS
  const busy = quote.isPending || build.isPending

  const errorText = (view: CashOutErrorView) =>
    view.kind === "pending"
      ? t("bank.cashOut.error.pending", {
          value: view.validUntil ? new Date(view.validUntil) : null,
        })
      : t(`bank.cashOut.error.${view.kind}`)

  const onQuote = form.handleSubmit((body) => {
    if (busy || coolingDown) return
    setQuotedAt(Date.now())
    build.reset()
    quote.mutate(body)
  })

  const onConfirm = form.handleSubmit((body) => {
    if (busy || !quoteFits || notAvailable) return
    build.mutate(body, {
      onSuccess: (data) => {
        const next = prepared.current
        if (!next || next.rampId !== data.ramp.id) return
        setStage({
          kind: "review",
          build: data,
          currency,
          hasApprove: next.approveTx !== null,
          chainId: next.redeemTx.chainId,
        })
      },
    })
  })

  return (
    <BankStepShell
      title={t("bank.cashOut.title")}
      description={accountLine}
      step="amount"
      onBack={onBack}
    >
      <ModalBody>
        <Stack gap="l">
          <FormProvider {...form}>
            <Stack gap="m">
              <Controller
                control={form.control}
                name="usdcAmount"
                render={({ field, fieldState }) => (
                  <FormField
                    label={t("bank.cashOut.form.amount")}
                    error={fieldState.error?.message}
                  >
                    <Input
                      {...field}
                      value={String(field.value ?? "")}
                      inputMode="decimal"
                      autoComplete="off"
                      isError={!!fieldState.error}
                    />
                  </FormField>
                )}
              />
              <Button
                variant="secondary"
                disabled={busy || coolingDown || notAvailable}
                onClick={() => void onQuote()}
              >
                {t(
                  quoteFits
                    ? "bank.cashOut.quote.refresh"
                    : "bank.cashOut.quote.get",
                )}
              </Button>
            </Stack>
          </FormProvider>
          {quoteFits && quote.data && (
            <BankCashOutQuote
              quote={quote.data.quote}
              payoutLimit={quote.data.payoutLimit}
              currency={currency}
            />
          )}
          {quoteError && (
            <Alert variant="warning" description={errorText(quoteError)} />
          )}
          {buildError && (
            <Alert variant="warning" description={errorText(buildError)} />
          )}
          {buildError?.kind === "pending" && buildError.rampId && (
            <Button
              variant="secondary"
              onClick={() => leaveTo(buildError.rampId!)}
            >
              {t("bank.cashOut.error.pendingOpen")}
            </Button>
          )}
          {quoteFits && !notAvailable && (
            <Button
              size="large"
              disabled={busy}
              onClick={() => void onConfirm()}
            >
              {t("bank.cashOut.confirm")}
            </Button>
          )}
          <BankCashOutHistory h160={h160} onOpen={leaveTo} />
        </Stack>
      </ModalBody>
    </BankStepShell>
  )
}
