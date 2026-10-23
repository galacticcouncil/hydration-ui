import {
  FiatEur,
  FiatUsd,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import PortfolioWalletImage from "@galacticcouncil/ui/assets/images/NoFunds.png"
import {
  Alert,
  Button,
  Collapsible,
  Flex,
  Icon,
  Image,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Separator,
  Spinner,
  Stack,
  Stepper,
  Summary,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SStepButton } from "@/modules/onramp/components/StepButton.styled"

import { BankDepositInstructions } from "./BankDepositInstructions"
import { BankDepositStatusChip } from "./BankDepositStatusChip"
import { BankDepositV2 } from "./BankDepositV2"
import { BankFlowPreviewNotice } from "./BankFlowPreviewNotice"
import { BankFlowSwitcher } from "./BankFlowSwitcher"
import { BankProviderHandoff } from "./BankProviderHandoff"
import { BankTransferStatusIllustration } from "./BankTransferStatusIllustration"
import {
  DepositCurrency,
  DepositStatus,
  depositSteps,
  exampleDeposits,
  RailStatus,
} from "./deposit.mock"
import {
  BANK_DEPOSIT_PREVIEW_WALLET as wallet,
  useBankDepositFlow,
} from "./useBankDepositFlow"

type BankDepositProps = { onBack: () => void }
const railStates: RailStatus[] = [
  "available",
  "in review",
  "more info needed",
  "rejected",
  "not offered in region",
]

export const BankDeposit: FC<BankDepositProps> = ({ onBack }) => {
  const { t } = useTranslation(["onramp", "common"])
  const flow = useBankDepositFlow()
  const {
    screen,
    setScreen,
    currency,
    setCurrency,
    accountType,
    setAccountType,
    onboardingStep,
    railStatus,
    setRailStatus,
    selectedDeposit,
    setSelectedDeposit,
    status,
    setStatus,
    preparingStep,
    setPreparingStep,
    goToAccount,
    railAvailable,
    railClosed,
    titles,
    variant,
    setVariant,
  } = flow
  const setupIndex = ([0, 1, 2] as const)[onboardingStep] ?? 2
  const backToEntry = () => {
    flow.cancelProviderHandoff()
    setScreen(screen === "tracking" ? "deposits" : "entry")
  }
  const next = () => {
    if (screen === "entry") {
      if (onboardingStep < 5 || !railAvailable) setScreen("onboarding")
      else goToAccount()
    } else if (screen === "onboarding") flow.continueOnboarding()
    else if (screen === "account") {
      setPreparingStep(0)
      setScreen("preparing")
    } else if (screen === "details" || screen === "tracking")
      setScreen("deposits")
    else if (screen === "deposits") setScreen("entry")
  }
  const action =
    screen === "onboarding"
      ? t(`bankProvider.action.${flow.onboardingAction}`)
      : screen === "entry"
        ? t(`bankCurrent.action.${railAvailable ? "continue" : "status"}`, {
            currency,
          })
        : screen === "account"
          ? t("bankCurrent.action.create")
          : screen === "preparing"
            ? t("bankV2.deposit.action.preparing")
            : screen === "deposits"
              ? t("bankCurrent.action.deposit")
              : screen === "tracking"
                ? t("bankCurrent.action.allDeposits")
                : t("bankV2.deposit.action.history")

  return (
    <BankFlowSwitcher
      variant={variant}
      onVariantChange={setVariant}
      stepKey={`${screen}:${flow.v2Stage}:${onboardingStep}:${flow.providerHandoff}`}
    >
      {variant === "v2" ? (
        <BankDepositV2 flow={flow} onBack={onBack} />
      ) : (
        <>
          <ModalHeader
            title={titles[screen]}
            align="center"
            sx={{ p: ["l", "xl"] }}
            onBack={() => {
              if (flow.providerHandoff === "away") flow.cancelProviderHandoff()
              else if (screen === "entry") onBack()
              else backToEntry()
            }}
          />
          <Separator />
          <ModalBody
            scrollable={false}
            data-bank-flow-body
            overflow="auto"
            sx={{ p: ["l", "xl"] }}
          >
            <Stack gap="l" justify="flex-start">
              {screen === "entry" && (
                <>
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("bankCurrent.entry.description")}
                  </Text>
                  <ToggleGroup
                    type="single"
                    fullWidth
                    value={currency}
                    onValueChange={(value: DepositCurrency) => {
                      if (value) setCurrency(value)
                    }}
                  >
                    <ToggleGroupItem value="USD">
                      USD · ACH / wire
                    </ToggleGroupItem>
                    <ToggleGroupItem value="EUR">EUR · SEPA</ToggleGroupItem>
                  </ToggleGroup>
                  <Summary
                    rows={[
                      {
                        label: t("bankCurrent.availability"),
                        content: (
                          <BankDepositStatusChip
                            status={railStatus[currency]}
                          />
                        ),
                      },
                      {
                        label: t("bankCurrent.send"),
                        content: t("bankCurrent.ownAccount", { currency }),
                      },
                      {
                        label: t("bankV2.deposit.receive"),
                        content: t("bankV2.deposit.destination"),
                      },
                    ]}
                  />
                  {!railAvailable && (
                    <Text fs="p5" color={getToken("text.medium")}>
                      {t("bankV2.deposit.railUnavailable")}
                    </Text>
                  )}
                  <Text fs="p6" color={getToken("text.medium")}>
                    {t("bankCurrent.powered")}
                  </Text>
                  <Collapsible
                    label={t("bankCurrent.previewRail", { currency })}
                    actionLabel={t("bankV2.details.show")}
                    actionLabelWhenOpen={t("bankV2.details.hide")}
                  >
                    <Stack pt="m" gap="m">
                      <Select<RailStatus>
                        fullWidth
                        value={railStatus[currency]}
                        aria-label={t("bankCurrent.previewRail", { currency })}
                        items={railStates.map((value) => ({
                          key: value,
                          label: t(`bankProvider.result.${value}`),
                        }))}
                        onValueChange={(value) =>
                          setRailStatus((current) => ({
                            ...current,
                            [currency]: value,
                          }))
                        }
                      />
                    </Stack>
                  </Collapsible>
                </>
              )}
              {screen === "onboarding" && (
                <>
                  {onboardingStep < 3 && (
                    <>
                      <Stepper
                        compact
                        activeStepIndex={onboardingStep}
                        steps={[
                          t("bankCurrent.setup.wallet"),
                          t("bankCurrent.setup.account"),
                          t("bankCurrent.setup.link"),
                          t("bankCurrent.setup.bridge"),
                        ]}
                      />
                      <Stack gap="m" align="center" py="l">
                        <Image
                          src={PortfolioWalletImage}
                          alt=""
                          aria-hidden
                          lazy={false}
                          sx={{ size: "3xl", objectFit: "contain" }}
                        />
                        <Text
                          as="h2"
                          font="primary"
                          fs="h7"
                          fw={500}
                          align="center"
                        >
                          {t(`bankV2.deposit.setupTitle.${setupIndex}`)}
                        </Text>
                        <Text
                          fs="p5"
                          align="center"
                          color={getToken("text.medium")}
                        >
                          {t(`bankV2.deposit.setupDescription.${setupIndex}`)}
                        </Text>
                      </Stack>
                      {onboardingStep === 1 && (
                        <ToggleGroup
                          type="single"
                          fullWidth
                          value={accountType}
                          onValueChange={(value) => {
                            if (value) setAccountType(value)
                          }}
                        >
                          <ToggleGroupItem value="Individual">
                            {t("bankV2.deposit.individual")}
                          </ToggleGroupItem>
                          <ToggleGroupItem value="Business">
                            {t("bankV2.deposit.business")}
                          </ToggleGroupItem>
                        </ToggleGroup>
                      )}
                    </>
                  )}
                  {onboardingStep >= 3 && (
                    <BankProviderHandoff
                      state={flow.providerHandoff}
                      status={railStatus[currency]}
                      verified={onboardingStep >= 5}
                      previewResponse={flow.providerPreviewResponse}
                      onPreviewResponseChange={flow.setProviderPreviewResponse}
                      onPreviewApproval={flow.previewProviderApproval}
                    />
                  )}
                </>
              )}
              {screen === "account" && (
                <>
                  <Flex align="center" gap="m">
                    <Icon
                      component={LandmarkIcon}
                      size="xl"
                      color={getToken("text.tint.secondary")}
                    />
                    <Text fs="p3" fw={500}>
                      {t("bankV2.deposit.accountTitle", { currency })}
                    </Text>
                  </Flex>
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("bankV2.deposit.reusable")}
                  </Text>
                  <Summary
                    rows={[
                      {
                        label: t("bankCurrent.currency"),
                        content: (
                          <Flex align="center" gap="base">
                            <Icon
                              component={currency === "EUR" ? FiatEur : FiatUsd}
                              size={24}
                            />
                            {currency}
                          </Flex>
                        ),
                      },
                      {
                        label: t("bankV2.deposit.method"),
                        content: currency === "USD" ? "ACH / wire" : "SEPA",
                      },
                      {
                        label: t("bankV2.deposit.receive"),
                        content: t("bankV2.deposit.destination"),
                      },
                      { label: t("bankV2.deposit.wallet"), content: wallet },
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
                    {t(
                      `bankV2.deposit.preparing.${preparingStep === 0 ? 0 : 1}`,
                    )}
                  </Text>
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("bankV2.deposit.preparingDescription")}
                  </Text>
                </Stack>
              )}
              {screen === "details" && (
                <>
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("bankV2.deposit.sendInstructions", {
                      currency,
                      rail: currency === "USD" ? "ACH / wire" : "SEPA",
                    })}
                  </Text>
                  <BankDepositInstructions currency={currency} />
                  <Alert
                    variant="warning"
                    description={t("bankV2.deposit.demoDetails")}
                  />
                  <Summary
                    rows={[
                      {
                        label: t("bankV2.deposit.receive"),
                        content: t("bankV2.deposit.destination"),
                      },
                      { label: t("bankV2.deposit.wallet"), content: wallet },
                    ]}
                  />
                  <Collapsible
                    label={t("bankV2.deposit.transferNotes")}
                    actionLabel={t("bankV2.details.show")}
                    actionLabelWhenOpen={t("bankV2.details.hide")}
                  >
                    <Text fs="p5" pt="m" color={getToken("text.medium")}>
                      {t("bankV2.deposit.transferDescription")}
                    </Text>
                  </Collapsible>
                </>
              )}
              {screen === "deposits" && (
                <Stack gap="m">
                  {exampleDeposits.map((deposit) => (
                    <SStepButton
                      key={deposit.id}
                      onClick={() => {
                        setSelectedDeposit(deposit)
                        setStatus(deposit.status)
                        setScreen("tracking")
                      }}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        gap="m"
                        width="100%"
                        wrap
                      >
                        <Stack gap="s">
                          <Text fs="p3" fw={500}>
                            {t("common:currency", {
                              value: deposit.amount,
                              symbol: deposit.currency,
                            })}
                          </Text>
                          <Text fs="p6" color={getToken("text.medium")}>
                            {deposit.date}
                          </Text>
                        </Stack>
                        <BankDepositStatusChip status={deposit.status} />
                      </Flex>
                    </SStepButton>
                  ))}
                </Stack>
              )}
              {screen === "tracking" && (
                <>
                  <Stack gap="m" align="center" py="l">
                    <BankTransferStatusIllustration
                      status={
                        status === "Credited"
                          ? "success"
                          : status === "Returned" ||
                              status === "Waiting for deposit limit"
                            ? "warning"
                            : "waiting"
                      }
                    />
                    <Text font="primary" fs={["h6", "h5"]}>
                      {t("common:currency", {
                        value: selectedDeposit.amount,
                        symbol: selectedDeposit.currency,
                      })}
                    </Text>
                    <BankDepositStatusChip status={status} />
                    <Text fs="p5" color={getToken("text.medium")}>
                      {selectedDeposit.date} · {wallet}
                    </Text>
                  </Stack>
                  <Alert
                    variant={status === "Returned" ? "warning" : "info"}
                    description={t(
                      `bankCurrent.tracking.${status === "Waiting for deposit limit" ? "limit" : status === "Credited" ? "credited" : status === "Returned" ? "returned" : status === "Queued on Hydration" ? "queued" : "pending"}`,
                    )}
                  />
                  <Collapsible
                    label={t("bankV2.deposit.tracking.details")}
                    actionLabel={t("bankV2.details.show")}
                    actionLabelWhenOpen={t("bankV2.details.hide")}
                  >
                    <Stack pt="m" gap="l">
                      {depositSteps.map((step, i) => {
                        const currentIndex =
                          status === "Waiting for deposit limit"
                            ? 2
                            : status === "Returned"
                              ? 0
                              : depositSteps.indexOf(status)
                        const completed =
                          i < currentIndex ||
                          (status === "Credited" && i === currentIndex)
                        return (
                          <Flex
                            key={step}
                            gap="m"
                            align="center"
                            aria-current={step === status ? "step" : undefined}
                          >
                            <Text
                              color={getToken(
                                completed || i === currentIndex
                                  ? "text.tint.secondary"
                                  : "text.medium",
                              )}
                            >
                              {completed ? "✓" : "○"}
                            </Text>
                            <Text
                              fs="p5"
                              fw={i === currentIndex ? 500 : 400}
                              color={getToken(
                                i <= currentIndex ? "text.high" : "text.medium",
                              )}
                            >
                              {step}
                            </Text>
                          </Flex>
                        )
                      })}
                      <Text fs="p5" color={getToken("text.medium")}>
                        {t("bankCurrent.tracking.finality")}
                      </Text>
                    </Stack>
                  </Collapsible>
                  <Collapsible
                    label={t("bankCurrent.previewStatus")}
                    actionLabel={t("bankV2.details.show")}
                    actionLabelWhenOpen={t("bankV2.details.hide")}
                  >
                    <Flex gap="s" pt="m" wrap>
                      {(
                        [
                          "Received by Bridge",
                          "Sent to Base",
                          "Arrived",
                          "Waiting for deposit limit",
                          "Depositing",
                          "Queued on Hydration",
                          "Credited",
                          "Returned",
                        ] as DepositStatus[]
                      ).map((state) => (
                        <Button
                          size="small"
                          variant={state === status ? "secondary" : "muted"}
                          key={state}
                          onClick={() => setStatus(state)}
                        >
                          {state}
                        </Button>
                      ))}
                    </Flex>
                  </Collapsible>
                </>
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
                disabled={
                  screen === "preparing" ||
                  (screen === "onboarding" && railClosed)
                }
                onClick={next}
              >
                {action}
              </Button>
              {screen === "entry" && (
                <Button
                  variant="transparent"
                  onClick={() => setScreen("deposits")}
                >
                  {t("bankV2.deposit.action.history")}
                </Button>
              )}
              {screen === "details" && (
                <Button
                  variant="transparent"
                  onClick={() => setScreen("entry")}
                >
                  {t("bankCurrent.action.otherCurrency")}
                </Button>
              )}
              {(screen === "onboarding" || screen === "account") && (
                <Button variant="transparent" onClick={backToEntry}>
                  {t("bankCurrent.action.back")}
                </Button>
              )}
            </Stack>
          </ModalFooter>
        </>
      )}
    </BankFlowSwitcher>
  )
}
