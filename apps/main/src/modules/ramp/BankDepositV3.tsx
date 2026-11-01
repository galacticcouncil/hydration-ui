import { Check, LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import BusinessKioskImage from "@galacticcouncil/ui/assets/images/BusinessKiosk3D.webp"
import IndividualBeachChairImage from "@galacticcouncil/ui/assets/images/IndividualBeachChair3D.webp"
import PortfolioWalletImage from "@galacticcouncil/ui/assets/images/NoFunds.png"
import {
  Alert,
  Button,
  Collapsible,
  Icon,
  Image,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
  Spinner,
  Stack,
  Stepper,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OnrampModalTopContent } from "@/modules/onramp/components/OnrampModalTopContent"
import { SStepButton } from "@/modules/onramp/components/StepButton.styled"

import { BankDepositAmount } from "./BankDepositAmount"
import { getBankDepositAmountError } from "./BankDepositV2.utils"
import { BankDepositV3Instructions } from "./BankDepositV3Instructions"
import { BankDepositV3Receive } from "./BankDepositV3Receive"
import { BankDepositV3Tracking } from "./BankDepositV3Tracking"
import { BankFlowPreviewNotice } from "./BankFlowPreviewNotice"
import { BankProviderHandoff } from "./BankProviderHandoff"
import {
  BANK_DEPOSIT_PREVIEW_WALLET,
  BankDepositFlow,
} from "./useBankDepositFlow"

type BankDepositV3Props = {
  flow: BankDepositFlow
  onBack: () => void
  onHistory: () => void
}

export const BankDepositV3: FC<BankDepositV3Props> = ({
  flow,
  onBack,
  onHistory,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const {
    screen,
    currency,
    amount,
    accountType,
    onboardingStep,
    railAvailable,
    railClosed,
    accounts,
    v2Stage,
    preparingStep,
  } = flow
  const waiting = screen === "details" && v2Stage === "waiting"
  const error = getBankDepositAmountError(amount, currency)
  const rail = currency === "USD" ? "ACH / wire" : "SEPA"
  const isHistory = screen === "tracking"
  const titleKey = isHistory
    ? "title"
    : waiting
      ? "title"
      : screen === "onboarding"
        ? "setup"
        : screen === "account" || screen === "preparing" || screen === "details"
          ? "details"
          : "title"
  const back = () => {
    if (flow.providerHandoff === "away") {
      flow.cancelProviderHandoff()
    } else if (screen === "entry") {
      onBack()
    } else {
      flow.setScreen("entry")
    }
  }
  const next = () => {
    if (screen === "entry") {
      if (onboardingStep < 5 || !railAvailable) flow.setScreen("onboarding")
      else flow.goToAccount()
    } else if (screen === "onboarding") {
      flow.continueOnboarding()
    } else if (screen === "account") {
      flow.setPreparingStep(0)
      flow.setScreen("preparing")
    } else if (screen === "details" && !waiting) {
      onHistory()
    } else if (screen === "details" || screen === "tracking") {
      onHistory()
    }
  }
  const action =
    screen === "entry"
      ? "continue"
      : screen === "account"
        ? "create"
        : screen === "preparing"
          ? "preparing"
          : screen === "details" || screen === "tracking"
            ? "history"
            : "again"
  const stepIndex =
    screen === "entry"
      ? 0
      : screen === "onboarding"
        ? 1
        : waiting
          ? flow.status === "Credited"
            ? 4
            : 3
          : 2
  const isProviderSummary =
    screen === "onboarding" &&
    onboardingStep >= 3 &&
    (flow.providerHandoff !== "idle" || onboardingStep >= 5 || railClosed)
  const setupIndex = ([0, 1, 2] as const)[onboardingStep] ?? 2

  return (
    <>
      {!isHistory && !isProviderSummary && (
        <OnrampModalTopContent>
          <Stepper
            maxWidth="100%"
            activeStepIndex={stepIndex}
            steps={[
              t("bankV2.deposit.steps.amount"),
              t("bankV2.deposit.steps.setup"),
              t("bankV2.deposit.steps.details"),
              t("bankV2.deposit.steps.transfer"),
            ]}
          />
        </OnrampModalTopContent>
      )}
      <ModalHeader
        title={
          isProviderSummary
            ? t("bankV3.setup.title")
            : screen === "details" && !waiting
              ? t("bankV3.deposit.details", { currency })
              : t(`bankV2.deposit.${titleKey}`)
        }
        align="center"
        onBack={back}
        sx={{ p: ["l", "xl"] }}
      />
      <Separator />
      <ModalBody
        scrollable={false}
        data-bank-flow-body
        overflow="auto"
        sx={{ p: ["l", "xl"] }}
      >
        <Stack gap={["l", "xl"]} justify="flex-start">
          {screen === "entry" && (
            <>
              <BankDepositAmount
                amount={amount}
                currency={currency}
                onAmountChange={flow.setAmount}
                onCurrencyChange={flow.setCurrency}
              />
              <BankDepositV3Receive amount={amount} />
              <Summary
                rows={[
                  {
                    label: t("bankV2.deposit.from"),
                    content: t("bankV2.deposit.yourBank"),
                  },
                ]}
              />
              <Text fs="p5" color={getToken("text.medium")}>
                {t("bankV2.deposit.push")}
              </Text>
              {accounts.includes(currency) && (
                <Button
                  variant="tertiary"
                  disabled={!railAvailable}
                  onClick={() => {
                    flow.setV2Stage("amount")
                    flow.setScreen("details")
                  }}
                >
                  {t("bankV2.deposit.existingDetails")}
                </Button>
              )}
            </>
          )}
          {screen === "onboarding" &&
            (onboardingStep >= 3 ? (
              <BankProviderHandoff
                compactHandoff
                figmaV3
                state={flow.providerHandoff}
                status={flow.railStatus[currency]}
                verified={onboardingStep >= 5}
                previewResponse={flow.providerPreviewResponse}
                onPreviewResponseChange={flow.setProviderPreviewResponse}
                onPreviewApproval={flow.previewProviderApproval}
              />
            ) : (
              <>
                <Stack gap="m" align="center" py="l">
                  {onboardingStep !== 1 && (
                    <Image
                      src={PortfolioWalletImage}
                      alt=""
                      aria-hidden
                      lazy={false}
                      sx={{ size: "3xl", objectFit: "contain" }}
                    />
                  )}
                  <Text as="h2" font="primary" fs="h7" fw={500} align="center">
                    {t(`bankV2.deposit.setupTitle.${setupIndex}`)}
                  </Text>
                  <Text fs="p5" align="center" color={getToken("text.medium")}>
                    {t(`bankV2.deposit.setupDescription.${setupIndex}`)}
                  </Text>
                </Stack>
                {onboardingStep === 1 && (
                  <Stack gap="s">
                    {(["Individual", "Business"] as const).map((type) => (
                      <SStepButton
                        key={type}
                        aria-label={type}
                        aria-pressed={accountType === type}
                        onClick={() => flow.setAccountType(type)}
                        sx={{
                          bg: getToken(
                            accountType === type
                              ? "controls.dim.active"
                              : "controls.dim.base",
                          ),
                        }}
                      >
                        <Image
                          src={
                            type === "Individual"
                              ? IndividualBeachChairImage
                              : BusinessKioskImage
                          }
                          alt=""
                          aria-hidden
                          lazy={false}
                          width={48}
                          height={48}
                          sx={{ flexShrink: 0, objectFit: "contain" }}
                        />
                        <Stack
                          gap="xs"
                          minWidth={0}
                          flex={1}
                          align="flex-start"
                        >
                          <Text fs="p4" fw={500}>
                            {t(
                              type === "Individual"
                                ? "bankV2.deposit.individual"
                                : "bankV2.deposit.business",
                            )}
                          </Text>
                          <Text fs="p6" color={getToken("text.medium")}>
                            {t(
                              type === "Individual"
                                ? "bankV3.setup.individualDescription"
                                : "bankV3.setup.businessDescription",
                            )}
                          </Text>
                        </Stack>
                        {accountType === type && (
                          <Icon component={Check} size="m" />
                        )}
                      </SStepButton>
                    ))}
                  </Stack>
                )}
              </>
            ))}
          {screen === "account" && (
            <>
              <Icon
                component={LandmarkIcon}
                size="xl"
                color={getToken("text.tint.secondary")}
              />
              <Text as="h2" font="primary" fs="h7" fw={500}>
                {t("bankV2.deposit.accountTitle", { currency })}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("bankV2.deposit.reusable")}
              </Text>
              <Summary
                rows={[
                  { label: t("bankV2.deposit.method"), content: rail },
                  {
                    label: t("bankV2.deposit.receive"),
                    content: t("bankV2.deposit.destination"),
                  },
                  {
                    label: t("bankV2.deposit.wallet"),
                    content: BANK_DEPOSIT_PREVIEW_WALLET,
                  },
                ]}
              />
            </>
          )}
          {screen === "preparing" && (
            <Stack
              gap="m"
              align="center"
              py="xl"
              role="status"
              aria-live="polite"
            >
              <Spinner size="3xl" />
              <Text as="h2" font="primary" fs="h7" fw={500} align="center">
                {t(`bankV2.deposit.preparing.${preparingStep === 0 ? 0 : 1}`)}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("bankV2.deposit.preparingDescription")}
              </Text>
            </Stack>
          )}
          {screen === "details" && !waiting && (
            <>
              <Alert
                description={t("bankV3.deposit.instructions", {
                  currency,
                  wallet: BANK_DEPOSIT_PREVIEW_WALLET,
                })}
              />
              <BankDepositV3Instructions currency={currency} />
              <Collapsible
                label={t("bankV3.preview.label")}
                actionLabel={t("bankV2.details.show")}
                actionLabelWhenOpen={t("bankV2.details.hide")}
              >
                <Stack gap="m" pt="m">
                  <Text fs="p6" color={getToken("text.medium")}>
                    {t("bankV2.deposit.demoDetails")}
                  </Text>
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => {
                      flow.setStatus("Received by Bridge")
                      flow.setV2Stage("waiting")
                    }}
                  >
                    {t("bankSimplified.deposit.previewStatus")}
                  </Button>
                </Stack>
              </Collapsible>
            </>
          )}
          {waiting && (
            <BankDepositV3Tracking
              amount={amount}
              currency={currency}
              status={flow.status}
              onStatusChange={flow.setStatus}
            />
          )}
          {screen === "tracking" && (
            <BankDepositV3Tracking
              amount={flow.selectedDeposit.amount}
              currency={flow.selectedDeposit.currency}
              status={flow.status}
              onStatusChange={flow.setStatus}
            />
          )}
        </Stack>
      </ModalBody>
      <Separator />
      <ModalFooter sx={{ p: ["l", "xl"] }}>
        <Stack gap="m" width="100%">
          <BankFlowPreviewNotice />
          <Button
            variant="secondary"
            size="large"
            width="100%"
            onClick={next}
            disabled={
              screen === "preparing" ||
              (screen === "entry" && !!error) ||
              (screen === "onboarding" && railClosed)
            }
          >
            {screen === "onboarding"
              ? t(
                  `bankProvider.action.${flow.providerHandoff === "away" ? "check" : flow.onboardingAction}`,
                )
              : t(`bankV2.deposit.action.${action}`)}
          </Button>
        </Stack>
      </ModalFooter>
    </>
  )
}
