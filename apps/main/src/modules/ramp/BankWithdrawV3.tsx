import { ChevronRight, LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  AssetInput,
  Button,
  Flex,
  Icon,
  Image,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
  Stack,
  Stepper,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import hollarIcon from "@/assets/ramp/Hollar.svg"
import { OnrampModalTopContent } from "@/modules/onramp/components/OnrampModalTopContent"
import { SStepButton } from "@/modules/onramp/components/StepButton.styled"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"

import { BankFlowPreviewNotice } from "./BankFlowPreviewNotice"
import {
  BankWithdrawalQuote,
  getBankWithdrawalAmountError,
  WithdrawalCurrency,
  WithdrawalStatus,
  WithdrawalStep,
} from "./BankWithdraw.utils"
import { BankWithdrawReceiveAmount } from "./BankWithdrawReceiveAmount"
import {
  BankWithdrawV2Account,
  BankWithdrawV2BankDetails,
  BankWithdrawV2BankSource,
} from "./BankWithdrawV2Account"
import { WithdrawalV3Status } from "./BankWithdrawV3Timeline.utils"
import { BankWithdrawV3Tracking } from "./BankWithdrawV3Tracking"

type BankWithdrawV3Props = {
  step: WithdrawalStep
  amount: string
  currency: WithdrawalCurrency
  quote: BankWithdrawalQuote | null
  submittedQuote: BankWithdrawalQuote | null
  submittedBank: BankWithdrawV2BankDetails | null
  effectiveBank: BankWithdrawV2BankDetails
  status: WithdrawalStatus
  v3Status: WithdrawalV3Status
  onV3StatusChange: (status: WithdrawalV3Status) => void
  bankSource: BankWithdrawV2BankSource
  bankDetails: BankWithdrawV2BankDetails
  onBankSourceChange: (source: BankWithdrawV2BankSource) => void
  onBankDetailsChange: (details: BankWithdrawV2BankDetails) => void
  onAmountChange: (amount: string) => void
  onCurrencyChange: (currency: WithdrawalCurrency) => void
  onDestinationPick: () => void
  onStatusChange: (status: WithdrawalStatus) => void
  onContinue: () => void
  onBack: () => void
}

const steps = ["amount", "account", "review", "tracking"] as const

export const BankWithdrawV3: FC<BankWithdrawV3Props> = ({
  step,
  amount,
  currency,
  quote,
  submittedQuote,
  submittedBank,
  effectiveBank,
  v3Status: status,
  bankSource,
  bankDetails,
  onBankSourceChange,
  onBankDetailsChange,
  onAmountChange,
  onCurrencyChange,
  onDestinationPick,
  onV3StatusChange: onStatusChange,
  onContinue,
  onBack,
}) => {
  const [quoteSeconds, setQuoteSeconds] = useState(180)
  useEffect(() => {
    if (step !== "review") return
    setQuoteSeconds(180)
    const timer = window.setInterval(
      () => setQuoteSeconds((value) => Math.max(0, value - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [step, amount, currency])
  const { t } = useTranslation(["onramp", "common"])
  const navigate = useNavigate()
  const setModal = useOnrampModal((state) => state.setModal)
  const viewHistory = () => {
    setModal(null)
    void navigate({
      to: "/portfolio/deposits",
      search: { depositStatus: "all" },
    })
  }
  const activeQuote = step === "tracking" ? submittedQuote : quote
  const belowMinimum = !!quote && Big(quote.amount).minus(quote.fee).lt(2)
  const amountError = getBankWithdrawalAmountError(amount, currency)
  const validManualDetails =
    Object.values(bankDetails).every((value) => value.trim()) &&
    bankDetails.account.startsWith("DEMO-") &&
    bankDetails.routing.startsWith("DEMO-")
  const activeBank = step === "tracking" ? submittedBank : effectiveBank
  const bankAccount = activeBank?.account ?? ""
  const validBank = bankSource === "saved" || validManualDetails
  const canContinue =
    step === "tracking" ||
    (!!quote && !belowMinimum && (step === "amount" || validBank))
  const amountMessage = amountError
    ? t(`bankWithdraw.amount.error.${amountError}`)
    : belowMinimum
      ? t("bankV2.withdraw.amount.minimum")
      : undefined
  return (
    <>
      <OnrampModalTopContent>
        <Stepper
          maxWidth="100%"
          steps={steps.map((value) =>
            value === "tracking"
              ? t("bankV3.withdraw.progress.transfer")
              : t(`bankV2.withdraw.progress.${value}`),
          )}
          activeStepIndex={
            status === "paid" && step === "tracking" ? 4 : steps.indexOf(step)
          }
        />
      </OnrampModalTopContent>
      <ModalHeader
        title={t("bankV2.withdraw.title")}
        align="center"
        onBack={onBack}
        sx={{ p: ["l", "xl"] }}
      />
      <Separator />
      <ModalBody
        scrollable={false}
        data-bank-flow-body
        overflow="auto"
        sx={{ p: ["l", "xl"] }}
      >
        <Stack
          gap={["l", "xl"]}
          justify="flex-start"
          data-onramp-step={`bankWithdraw:v3:${step}`}
        >
          {step === "amount" && (
            <>
              <AssetInput
                label={t("bankV2.withdraw.amount.label")}
                asset={{
                  symbol: "HOLLAR",
                  icon: (
                    <Image
                      src={hollarIcon}
                      alt=""
                      aria-hidden
                      lazy={false}
                      sx={{ size: pxToRem(30), flexShrink: 0 }}
                    />
                  ),
                }}
                value={amount}
                onChange={onAmountChange}
                amountError={amount ? amountMessage : undefined}
              />
              <BankWithdrawReceiveAmount
                figmaV3
                quote={belowMinimum ? null : quote}
                currency={currency}
                onCurrencyChange={onCurrencyChange}
              />
              <Separator />
              <SStepButton onClick={onDestinationPick}>
                <Icon
                  component={LandmarkIcon}
                  size="l"
                  color={getToken("text.tint.secondary")}
                />
                <Stack gap="xs" minWidth={0} flex={1} align="flex-start">
                  <Text fs="p4" fw={500}>
                    {t("bankV2.withdraw.bank.destination")}
                  </Text>
                  <Text
                    fs="p6"
                    color={getToken("text.medium")}
                    wordBreak="break-word"
                  >
                    {bankAccount}
                  </Text>
                </Stack>
                <Icon component={ChevronRight} size="m" />
              </SStepButton>
            </>
          )}
          {step === "account" && (
            <BankWithdrawV2Account
              figmaV3
              currency={currency}
              source={bankSource}
              details={bankDetails}
              onSourceChange={onBankSourceChange}
              onDetailsChange={onBankDetailsChange}
            />
          )}
          {step === "review" && activeQuote && (
            <>
              <Stack gap="s" py="base" align="flex-start">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("bankV2.withdraw.review.sell")}
                </Text>
                <Flex align="center" gap="m">
                  <Image
                    src={hollarIcon}
                    alt=""
                    aria-hidden
                    lazy={false}
                    sx={{ size: pxToRem(30), flexShrink: 0 }}
                  />
                  <Text fs={["h6", "h5"]} font="primary">
                    {t("common:currency", {
                      value: activeQuote.amount,
                      symbol: "HOLLAR",
                    })}
                  </Text>
                </Flex>
              </Stack>
              <Summary
                rows={[
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
                    content: currency,
                  },
                  {
                    label: t("bankSimplified.withdraw.fee"),
                    content: t("common:currency", {
                      value: activeQuote.fee,
                      symbol: "HOLLAR",
                    }),
                  },
                  {
                    label: t("bankV2.withdraw.amount.receive"),
                    content: t("common:currency", {
                      value: activeQuote.received,
                      symbol: activeQuote.currency,
                    }),
                  },
                  {
                    label: t("bankV3.withdraw.review.bridgeFee"),
                    content: t("common:currency", {
                      value: "0",
                      symbol: currency,
                    }),
                  },
                  {
                    label: t("bankV3.withdraw.review.quoteValid"),
                    content: `${Math.floor(quoteSeconds / 60)}:${String(quoteSeconds % 60).padStart(2, "0")}`,
                  },
                ]}
              />
              {quoteSeconds === 0 && (
                <Alert
                  variant="warning"
                  description={t("bankV3.withdraw.review.quoteExpired")}
                />
              )}
              <Text fs="p6" color={getToken("text.medium")}>
                {t("bankV2.withdraw.review.feeDescription")}
              </Text>
              <Text fs="p5" color={getToken("text.medium")} lh={1.4}>
                {t("bankV2.withdraw.review.previewDescription")}
              </Text>
            </>
          )}
          {step === "tracking" && activeQuote && activeBank && (
            <BankWithdrawV3Tracking
              quote={activeQuote}
              bankAccount={bankAccount}
              status={status}
              onStatusChange={onStatusChange}
            />
          )}
        </Stack>
      </ModalBody>
      <Separator />
      <ModalFooter sx={{ p: ["l", "xl"] }}>
        <Stack gap="m" width="100%">
          <BankFlowPreviewNotice />
          <Button
            size="large"
            variant="secondary"
            width="100%"
            disabled={!canContinue}
            onClick={
              step === "tracking"
                ? viewHistory
                : step === "review" && quoteSeconds === 0
                  ? () => setQuoteSeconds(180)
                  : onContinue
            }
          >
            {t(
              step === "review"
                ? quoteSeconds === 0
                  ? "bankV3.withdraw.review.refreshQuote"
                  : "bankV2.withdraw.preview"
                : step === "tracking"
                  ? "bankV2.deposit.action.history"
                  : "bankV2.withdraw.continue",
            )}
          </Button>
        </Stack>
      </ModalFooter>
    </>
  )
}
