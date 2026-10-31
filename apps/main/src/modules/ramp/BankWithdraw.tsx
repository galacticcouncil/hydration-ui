import {
  Button,
  Collapsible,
  Flex,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
  Stack,
  StepTrigger,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankFlowPreviewNotice } from "./BankFlowPreviewNotice"
import { BankFlowSwitcher, BankFlowVariant } from "./BankFlowSwitcher"
import {
  BANK_SIMPLIFIED_PREVIEW_FEE,
  BankWithdrawalQuote,
  getBankWithdrawalQuote,
  getDemoWithdrawalBank,
  WithdrawalCurrency,
  WithdrawalStatus,
  WithdrawalStep,
} from "./BankWithdraw.utils"
import { BankWithdrawAccount } from "./BankWithdrawAccount"
import { BankWithdrawAmount } from "./BankWithdrawAmount"
import { BankWithdrawReview } from "./BankWithdrawReview"
import { BankWithdrawSimplified } from "./BankWithdrawSimplified"
import { BankWithdrawTracking } from "./BankWithdrawTracking"
import { BankWithdrawV2 } from "./BankWithdrawV2"
import {
  BankWithdrawV2BankDetails,
  BankWithdrawV2BankSource,
} from "./BankWithdrawV2Account"
import { BankWithdrawV3 } from "./BankWithdrawV3"
import { WithdrawalV3Status } from "./BankWithdrawV3Timeline.utils"

type BankWithdrawProps = { onBack: () => void }

const setupSteps = ["amount", "account", "review"] as const

export const BankWithdraw: FC<BankWithdrawProps> = ({ onBack }) => {
  const { t } = useTranslation(["onramp", "common"])
  const [variant, setVariant] = useState<BankFlowVariant>("v3")
  const [bankSource, setBankSource] =
    useState<BankWithdrawV2BankSource>("saved")
  const [manualBanks, setManualBanks] = useState<
    Record<WithdrawalCurrency, BankWithdrawV2BankDetails>
  >(() => ({
    USD: {
      beneficiary: t("bankWithdraw.account.demoBeneficiary"),
      bank: t("bankWithdraw.account.demoBank"),
      ...getDemoWithdrawalBank("USD"),
    },
    EUR: {
      beneficiary: t("bankWithdraw.account.demoBeneficiary"),
      bank: t("bankWithdraw.account.demoBank"),
      ...getDemoWithdrawalBank("EUR"),
    },
  }))
  const [step, setStep] = useState<WithdrawalStep>("amount")
  const [completedSteps, setCompletedSteps] = useState<Set<WithdrawalStep>>(
    () => new Set(),
  )
  const [amount, setAmount] = useState("100")
  const [currency, setCurrency] = useState<WithdrawalCurrency>("USD")
  const [v3Status, setV3Status] = useState<WithdrawalV3Status>("redeemed")
  const [status, setStatus] = useState<WithdrawalStatus>("pending")
  const [submittedQuote, setSubmittedQuote] =
    useState<BankWithdrawalQuote | null>(null)
  const [submittedBank, setSubmittedBank] =
    useState<BankWithdrawV2BankDetails | null>(null)
  const quote = getBankWithdrawalQuote(
    amount,
    currency,
    variant === "simplified" || variant === "v3"
      ? BANK_SIMPLIFIED_PREVIEW_FEE
      : undefined,
  )
  const effectiveBank: BankWithdrawV2BankDetails =
    bankSource === "manual"
      ? manualBanks[currency]
      : {
          beneficiary: t("bankWithdraw.account.demoBeneficiary"),
          bank: t("bankWithdraw.account.demoBank"),
          ...getDemoWithdrawalBank(currency),
        }
  const isBankValid =
    bankSource === "saved" ||
    (Object.values(effectiveBank).every((value) => value.trim()) &&
      effectiveBank.account.startsWith("DEMO-") &&
      effectiveBank.routing.startsWith("DEMO-"))
  const changeCurrency = (nextCurrency: WithdrawalCurrency) => {
    if (step === "tracking" || nextCurrency === currency) return
    setCurrency(nextCurrency)
    setSubmittedQuote(null)
    setSubmittedBank(null)
    setCompletedSteps(new Set())
    setStep("amount")
  }
  const changeAmount = (value: string) => {
    setAmount(value)
    setCompletedSteps(new Set())
  }
  const invalidateBankCompletion = () => {
    setCompletedSteps(
      (current) => new Set([...current].filter((value) => value === "amount")),
    )
  }
  const canOpenStep = (value: (typeof setupSteps)[number]) =>
    value === "amount" ||
    (!!quote &&
      completedSteps.has("amount") &&
      (value === "account" || (completedSteps.has("account") && isBankValid)))
  const goBack = () => {
    if (step === "amount") onBack()
    else
      setStep(
        step === "account"
          ? "amount"
          : step === "review"
            ? "account"
            : "review",
      )
  }
  const continueFlow = () => {
    if (!quote || ((step === "account" || step === "review") && !isBankValid))
      return
    if (step !== "tracking") {
      setCompletedSteps((current) => new Set([...current, step]))
    }
    if (step === "amount") setStep("account")
    else if (step === "account") setStep("review")
    else if (step === "review") {
      setSubmittedQuote(quote)
      setSubmittedBank({ ...effectiveBank })
      setStatus("pending")
      setV3Status("redeemed")
      setStep("tracking")
    } else {
      setSubmittedQuote(null)
      setSubmittedBank(null)
      setAmount("100")
      setCompletedSteps(new Set())
      setStep("amount")
    }
  }
  const BankWithdrawSteps =
    variant === "v3"
      ? BankWithdrawV3
      : variant === "simplified"
        ? BankWithdrawSimplified
        : BankWithdrawV2
  return (
    <BankFlowSwitcher
      variants={["current", "v2", "simplified", "v3"]}
      variant={variant}
      onVariantChange={setVariant}
      stepKey={
        step === "tracking"
          ? `${step}:${variant === "v3" ? v3Status : status}`
          : step
      }
    >
      {variant !== "current" ? (
        <BankWithdrawSteps
          step={step}
          amount={amount}
          currency={currency}
          quote={quote}
          submittedQuote={submittedQuote}
          submittedBank={submittedBank}
          effectiveBank={effectiveBank}
          status={status}
          v3Status={v3Status}
          onV3StatusChange={setV3Status}
          bankSource={bankSource}
          bankDetails={manualBanks[currency]}
          onBankSourceChange={(source) => {
            setBankSource(source)
            invalidateBankCompletion()
          }}
          onBankDetailsChange={(details) => {
            setManualBanks((current) => ({ ...current, [currency]: details }))
            invalidateBankCompletion()
          }}
          onAmountChange={changeAmount}
          onCurrencyChange={changeCurrency}
          onDestinationPick={() => {
            if (quote) {
              setCompletedSteps((current) => new Set([...current, "amount"]))
            }
            setStep("account")
          }}
          onStatusChange={setStatus}
          onContinue={continueFlow}
          onBack={goBack}
        />
      ) : (
        <>
          <ModalHeader
            title={t("bankWithdraw.title")}
            align="center"
            onBack={goBack}
            sx={{ p: ["l", "xl"] }}
          />
          <Separator />
          <ModalBody
            scrollable={false}
            data-bank-flow-body
            overflow="auto"
            sx={{
              px: ["l", "xl"],
              py: step === "tracking" ? ["l", "xl"] : 0,
            }}
          >
            {step === "tracking" ? (
              submittedQuote &&
              submittedBank && (
                <BankWithdrawTracking
                  quote={submittedQuote}
                  bankAccount={submittedBank.account}
                  status={status}
                  onStatusChange={setStatus}
                />
              )
            ) : (
              <Stack separated justify="flex-start" data-bank-withdraw-steps>
                {setupSteps.map((value, index) => (
                  <Collapsible
                    key={value}
                    open={step === value}
                    onOpenChange={(open) => {
                      if (open && canOpenStep(value)) setStep(value)
                    }}
                    trigger={
                      <StepTrigger
                        stepNumber={index + 1}
                        title={t(`bankWithdraw.progress.${value}`)}
                        description={
                          completedSteps.has(value)
                            ? value === "amount"
                              ? t("common:currency", {
                                  value: amount,
                                  symbol: "HOLLAR",
                                })
                              : value === "account"
                                ? effectiveBank.account
                                : undefined
                            : undefined
                        }
                        state={
                          step === value
                            ? "active"
                            : completedSteps.has(value)
                              ? "done"
                              : "todo"
                        }
                        disabled={step !== value && !canOpenStep(value)}
                      />
                    }
                  >
                    <Stack gap="l" pb="l" minWidth={0}>
                      {value === "amount" && (
                        <BankWithdrawAmount
                          amount={amount}
                          currency={currency}
                          onAmountChange={changeAmount}
                          onCurrencyChange={changeCurrency}
                        />
                      )}
                      {value === "account" && (
                        <BankWithdrawAccount
                          currency={currency}
                          source={bankSource}
                          details={manualBanks[currency]}
                          onSourceChange={(source) => {
                            setBankSource(source)
                            invalidateBankCompletion()
                          }}
                          onDetailsChange={(details) => {
                            setManualBanks((current) => ({
                              ...current,
                              [currency]: details,
                            }))
                            invalidateBankCompletion()
                          }}
                        />
                      )}
                      {value === "review" && quote && (
                        <BankWithdrawReview
                          quote={quote}
                          bankAccount={effectiveBank.account}
                        />
                      )}
                    </Stack>
                  </Collapsible>
                ))}
              </Stack>
            )}
          </ModalBody>
          <Separator />
          <ModalFooter sx={{ p: ["l", "xl"] }}>
            <Stack gap="m" width="100%">
              <BankFlowPreviewNotice />
              <Flex gap="m" align="center">
                <Button variant="muted" size="large" onClick={goBack}>
                  {t("bankWithdraw.back")}
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  sx={{ flex: 1, minWidth: 0, whiteSpace: "normal" }}
                  disabled={
                    step !== "tracking" &&
                    (!quote ||
                      ((step === "account" || step === "review") &&
                        !isBankValid))
                  }
                  onClick={continueFlow}
                >
                  {t(
                    step === "review"
                      ? "bankWithdraw.confirm"
                      : step === "tracking"
                        ? "bankWithdraw.again"
                        : "bankWithdraw.continue",
                  )}
                </Button>
              </Flex>
            </Stack>
          </ModalFooter>
        </>
      )}
    </BankFlowSwitcher>
  )
}
