import { ChevronRight, LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
  Stack,
  Stepper,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { OnrampModalTopContent } from "@/modules/onramp/components/OnrampModalTopContent"
import { SStepButton } from "@/modules/onramp/components/StepButton.styled"

import { BankAmountInput } from "./BankAmountInput"
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
import { BankWithdrawV2Tracking } from "./BankWithdrawV2Tracking"

type BankWithdrawV2Props = {
  step: WithdrawalStep
  amount: string
  currency: WithdrawalCurrency
  quote: BankWithdrawalQuote | null
  submittedQuote: BankWithdrawalQuote | null
  submittedBank: BankWithdrawV2BankDetails | null
  effectiveBank: BankWithdrawV2BankDetails
  status: WithdrawalStatus
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

const steps = ["amount", "account", "review"] as const

export const BankWithdrawV2: FC<BankWithdrawV2Props> = ({
  step,
  amount,
  currency,
  quote,
  submittedQuote,
  submittedBank,
  effectiveBank,
  status,
  bankSource,
  bankDetails,
  onBankSourceChange,
  onBankDetailsChange,
  onAmountChange,
  onCurrencyChange,
  onDestinationPick,
  onStatusChange,
  onContinue,
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const activeQuote = step === "tracking" ? submittedQuote : quote
  // The preview only estimates USDC settlement, not Bridge's final fiat quote.
  const settlement = activeQuote
    ? Big(activeQuote.amount).minus(activeQuote.fee).toFixed(2, Big.roundDown)
    : "0"
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
      {step !== "tracking" && (
        <OnrampModalTopContent>
          <Stepper
            maxWidth={300}
            steps={steps.map((value) => t(`bankV2.withdraw.progress.${value}`))}
            activeStepIndex={step === "amount" ? 0 : step === "account" ? 1 : 2}
          />
        </OnrampModalTopContent>
      )}
      <ModalHeader
        title={t("bankV2.withdraw.title")}
        description={t(`bankV2.withdraw.step.${step}`)}
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
          data-onramp-step={`bankWithdraw:v2:${step}`}
        >
          {step === "amount" && (
            <>
              <BankAmountInput
                isFirstSection
                label={t("bankV2.withdraw.amount.label")}
                asset={{
                  symbol: "HOLLAR",
                  icon: <AssetLogo id={HOLLAR_ASSET_ID} size="medium" />,
                }}
                value={amount}
                onChange={onAmountChange}
                amountError={amount ? amountMessage : undefined}
                displayValue={t("bankV2.withdraw.amount.sample")}
              />
              <BankWithdrawReceiveAmount
                quote={belowMinimum ? null : quote}
                currency={currency}
                onCurrencyChange={onCurrencyChange}
              />
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
              currency={currency}
              source={bankSource}
              details={bankDetails}
              onSourceChange={onBankSourceChange}
              onDetailsChange={onBankDetailsChange}
            />
          )}
          {step === "review" && activeQuote && (
            <>
              <Stack gap="s" py="base" align="center">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("bankV2.withdraw.review.sell")}
                </Text>
                <Flex align="center" gap="m">
                  <AssetLogo id={HOLLAR_ASSET_ID} size="medium" />
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
                    label: t("bankV2.withdraw.review.sampleFee"),
                    content: t("common:currency", {
                      value: activeQuote.fee,
                      symbol: "HOLLAR",
                    }),
                  },
                  {
                    label: t("bankV2.withdraw.review.settlement"),
                    content: t("common:currency", {
                      value: settlement,
                      symbol: "USDC",
                    }),
                  },
                  {
                    label: t("bankTransfer.review.additionalFees"),
                    content: t("bankV2.deposit.providerQuote"),
                  },
                  {
                    label: t("bankV2.deposit.arrival"),
                    content: t("bankTransfer.review.arrivalUnavailable"),
                  },
                ]}
              />
              <Text fs="p6" color={getToken("text.medium")}>
                {t("bankV2.withdraw.review.feeDescription")}
              </Text>
              <Text fs="p5" color={getToken("text.medium")} lh={1.4}>
                {t("bankV2.withdraw.review.previewDescription")}
              </Text>
            </>
          )}
          {step === "tracking" && activeQuote && activeBank && (
            <BankWithdrawV2Tracking
              quote={activeQuote}
              settlement={settlement}
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
            onClick={onContinue}
          >
            {t(
              step === "review"
                ? "bankV2.withdraw.preview"
                : step === "tracking"
                  ? "bankV2.withdraw.again"
                  : "bankV2.withdraw.continue",
            )}
          </Button>
        </Stack>
      </ModalFooter>
    </>
  )
}
