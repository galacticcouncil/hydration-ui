import {
  Alert,
  Button,
  ModalBody,
  ModalFooter,
  Paper,
  Stack,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { useBankAccountLine } from "@/modules/onramp/bank/components/BankAccountPicker"
import type { BankCashOutFormValues } from "@/modules/onramp/bank/components/BankCashOut.form"
import { BankCashOutQuote } from "@/modules/onramp/bank/components/BankCashOutQuote"
import { BankCashOutReview } from "@/modules/onramp/bank/components/BankCashOutReview"
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
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"
import { strictEvmDigest } from "@/modules/transactions/utils/strictEvm"
import { useTransactionsStore } from "@/states/transactions"

// The quote route allows 30 calls per 10 minutes per wallet: one each 20 s.
export const QUOTE_REFRESH_MS = 20_000

type Stage =
  | { kind: "quote" }
  | {
      kind: "review"
      build: Omit<RampBuildResponse, "approveTx" | "redeemTx">
      currency: "usd" | "eur"
      hasApprove: boolean
      chainId: number
    }

type BankCashOutProps = {
  h160: string
  /** The account chosen on the step before; a cash-out goes to it only. */
  account: BankAccountView
  /** The USDC amount entered on W01 (already checked against the request rule). */
  usdcAmount: string
  onBack: () => void
  /** The ramp's status view (Transfer step): after Sign, Not now, or a pending one. */
  onStatus: (rampId: string) => void
}

const sameRequest = (
  a: BankCashOutFormValues | undefined,
  b: { bankAccountId?: string; usdcAmount?: unknown },
) =>
  !!a &&
  a.bankAccountId === b.bankAccountId &&
  a.usdcAmount === String(b.usdcAmount ?? "").trim()

/**
 * Cash out to a bank account (API doc 4: quote, build, report; rule 11), as
 * Figma W05: the read-only quote of the amount and account chosen before,
 * then Confirm (the binding build) and the review whose Sign hands the two
 * strict steps (W06: approve, then redeem) to createTransaction. The build's
 * unsigned transactions live in `prepared` (a ref) only until they are handed
 * over, once; then the ref is cleared and the flow shows the ramp's status.
 */
export const BankCashOut: FC<BankCashOutProps> = ({
  h160,
  account,
  usdcAmount,
  onBack,
  onStatus,
}) => {
  const { t } = useTranslation(["onramp"])
  const service = useHbrService()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const [stage, setStage] = useState<Stage>({ kind: "quote" })
  const prepared = useRef<PreparedCashOut | null>(null)
  const [quotedAt, setQuotedAt] = useState(0)
  const [, setTick] = useState(0)

  const body: BankCashOutFormValues = {
    bankAccountId: account.id,
    usdcAmount,
  }
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

  // W05 opens on the read-only quote of the amount chosen before: asked once
  // per mount (a ref, so a re-run effect asks nothing more); later reads are
  // the user's Refresh, at most one per QUOTE_REFRESH_MS.
  const asked = useRef(false)
  useEffect(() => {
    if (asked.current) return
    asked.current = true
    setQuotedAt(Date.now())
    quote.mutate({ bankAccountId: account.id, usdcAmount })
  }, [quote, account.id, usdcAmount])

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
    onStatus(rampId)
  }

  const leaveTo = (rampId: string) => {
    prepared.current = null
    quote.reset()
    build.reset()
    onStatus(rampId)
  }

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

  const quoteFits = quote.isSuccess && sameRequest(quote.variables, body)
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

  const onQuote = () => {
    if (busy || coolingDown) return
    setQuotedAt(Date.now())
    build.reset()
    quote.mutate(body)
  }

  const onConfirm = () => {
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
  }

  const credited =
    quoteFits && quote.data ? quote.data.quote.bridgeCredited : null

  return (
    <BankStepShell
      title={t("bank.cashOut.title")}
      step="review"
      onBack={onBack}
    >
      <ModalBody>
        <Stack gap="l">
          <Paper p="l" bg="dim">
            <Stack gap="xs" align="center">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("bank.cashOut.summary.bridgeReceives")}
              </Text>
              <Text
                font="primary"
                fs="h6"
                color={getToken("text.high")}
                data-summary-credited={credited ?? ""}
              >
                {credited
                  ? t("bank.cashOut.quote.usdc", {
                      amount: formatUsdcBaseUnits(credited) ?? "-",
                    })
                  : t("bank.cashOut.summary.quoting")}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("bank.cashOut.summary.from", { amount: usdcAmount })}
              </Text>
              <Text fs="p5" color={getToken("text.low")}>
                {accountLine}
              </Text>
            </Stack>
          </Paper>
          <Stack gap="s">
            <Text
              font="primary"
              fs="p2"
              color={getToken("text.tint.secondary")}
            >
              {t("bank.cashOut.summary.overview")}
            </Text>
            <SummaryRow
              label={t("bank.cashOut.summary.toAccount")}
              content={accountLine}
            />
            <SummaryRow
              label={t("bank.cashOut.summary.payoutCurrency")}
              content={t(`bank.deposit.currency.${currency}`)}
            />
            {quoteFits && quote.data && (
              <BankCashOutQuote
                quote={quote.data.quote}
                payoutLimit={quote.data.payoutLimit}
                currency={currency}
              />
            )}
          </Stack>
          {quoteError && (
            <Alert variant="warning" description={errorText(quoteError)} />
          )}
          {buildError && (
            <Alert variant="warning" description={errorText(buildError)} />
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Stack gap="m" width="100%">
          {buildError?.kind === "pending" && buildError.rampId && (
            <Button
              size="large"
              variant="secondary"
              onClick={() => leaveTo(buildError.rampId!)}
            >
              {t("bank.cashOut.error.pendingOpen")}
            </Button>
          )}
          {quoteFits && !notAvailable && (
            <Button size="large" disabled={busy} onClick={onConfirm}>
              {t("bank.cashOut.confirm")}
            </Button>
          )}
          <Button
            size="large"
            variant="tertiary"
            disabled={busy || coolingDown || notAvailable}
            onClick={onQuote}
          >
            {t(
              quoteFits
                ? "bank.cashOut.quote.refresh"
                : "bank.cashOut.quote.get",
            )}
          </Button>
        </Stack>
      </ModalFooter>
    </BankStepShell>
  )
}
