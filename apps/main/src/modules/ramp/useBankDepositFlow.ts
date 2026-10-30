import { useAccount } from "@galacticcouncil/web3-connect"
import { useCallback, useEffect, useState } from "react"

import { BankFlowVariant } from "./BankFlowSwitcher"
import {
  BankProviderHandoffState,
  getBankProviderHandoffAction,
} from "./BankProviderHandoff.utils"
import {
  DepositCurrency,
  DepositStatus,
  exampleDeposits,
  RailStatus,
} from "./deposit.mock"
import { useBankPreviewStore } from "./useBankPreviewStore"

export type BankDepositScreen =
  | "entry"
  | "onboarding"
  | "account"
  | "preparing"
  | "details"
  | "tracking"
export type BankDepositV2Stage = "amount" | "review" | "waiting"
export const BANK_DEPOSIT_PREVIEW_WALLET = "0x1234…89ab"

export const useBankDepositFlow = () => {
  const { account } = useAccount()
  const address = account?.address ?? ""
  const saved = useBankPreviewStore.getState().setups[address]
  const [owner, setOwner] = useState(address)
  const [variant, setVariant] = useState<BankFlowVariant>("simplified")
  const [v2Stage, setV2Stage] = useState<BankDepositV2Stage>("amount")
  const [amount, setAmount] = useState(saved?.amount ?? "500")
  const [screen, setScreen] = useState<BankDepositScreen>(
    saved?.screen ?? "entry",
  )
  const [currency, setCurrency] = useState<DepositCurrency>(
    saved?.currency ?? "USD",
  )
  const [accountType, setAccountType] = useState(
    saved?.accountType ?? "Individual",
  )
  const [onboardingStep, setOnboardingStep] = useState(
    saved?.onboardingStep ?? 0,
  )
  const [railStatus, setRailStatus] = useState<
    Record<DepositCurrency, RailStatus>
  >(saved?.railStatus ?? { USD: "available", EUR: "in review" })
  const [accounts, setAccounts] = useState<DepositCurrency[]>(
    saved?.accounts ?? [],
  )
  const [selectedDeposit, setSelectedDeposit] = useState(exampleDeposits[0]!)
  const [status, setStatus] = useState<DepositStatus>(selectedDeposit.status)
  const [providerHandoff, setProviderHandoff] =
    useState<BankProviderHandoffState>(saved?.providerHandoff ?? "idle")
  const [providerPreviewResponse, setProviderPreviewResponse] =
    useState<RailStatus>("in review")
  const [preparingStep, setPreparingStep] = useState(0)

  useEffect(() => {
    if (owner !== address) {
      const draft = useBankPreviewStore.getState().setups[address]
      setOwner(address)
      setAmount(draft?.amount ?? "500")
      setCurrency(draft?.currency ?? "USD")
      setAccountType(draft?.accountType ?? "Individual")
      setOnboardingStep(draft?.onboardingStep ?? 0)
      setRailStatus(draft?.railStatus ?? { USD: "available", EUR: "in review" })
      setAccounts(draft?.accounts ?? [])
      setProviderHandoff(draft?.providerHandoff ?? "idle")
      setScreen(draft?.screen ?? "entry")
      setV2Stage("amount")
      return
    }
    if (
      variant !== "simplified" ||
      !address ||
      screen === "entry" ||
      screen === "tracking"
    )
      return
    useBankPreviewStore.getState().saveSetup(address, {
      amount,
      currency,
      accountType,
      onboardingStep,
      railStatus,
      accounts,
      providerHandoff,
      screen: screen === "preparing" ? "account" : screen,
    })
  }, [
    owner,
    address,
    variant,
    screen,
    amount,
    currency,
    accountType,
    onboardingStep,
    railStatus,
    accounts,
    providerHandoff,
  ])

  useEffect(() => {
    if (screen !== "preparing") return
    const timer = window.setTimeout(() => {
      if (preparingStep === 0) setPreparingStep(1)
      else {
        setAccounts((current) =>
          current.includes(currency) ? current : [...current, currency],
        )
        setScreen("details")
      }
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [screen, preparingStep, currency])

  const changeScreen = useCallback((nextScreen: BankDepositScreen) => {
    if (nextScreen === "entry") setV2Stage("amount")
    setScreen(nextScreen)
  }, [])
  const changeCurrency = useCallback((nextCurrency: DepositCurrency) => {
    setV2Stage("amount")
    setProviderHandoff("idle")
    setProviderPreviewResponse("in review")
    setCurrency(nextCurrency)
  }, [])

  const goToAccount = () =>
    setScreen(accounts.includes(currency) ? "details" : "account")
  const railAvailable = railStatus[currency] === "available"
  const railClosed =
    railStatus[currency] === "rejected" ||
    railStatus[currency] === "not offered in region"
  const providerAction = getBankProviderHandoffAction({
    state: providerHandoff,
    status: railStatus[currency],
    verified: onboardingStep >= 5,
  })
  const onboardingAction =
    onboardingStep < 3
      ? ((["signIn", "continue", "bind"] as const)[onboardingStep] ?? "signIn")
      : providerAction
  const applyProviderResponse = (response: RailStatus) => {
    setProviderHandoff("returned")
    setRailStatus((current) => ({
      ...current,
      [currency]: response,
    }))
    setOnboardingStep((current) =>
      response === "available" ? 5 : Math.max(current, 3),
    )
  }
  const previewProviderApproval = () => {
    setProviderPreviewResponse("available")
    applyProviderResponse("available")
  }
  const continueOnboarding = () => {
    if (onboardingStep < 3) {
      setOnboardingStep((current) => current + 1)
      return
    }
    if (providerAction === "continue") goToAccount()
    else if (providerAction === "launch") setProviderHandoff("away")
    else if (providerAction === "return" || providerAction === "check") {
      // Preview of the status returned by the provider. Clicking the handoff
      // itself never approves terms, identity checks or a currency rail.
      applyProviderResponse(providerPreviewResponse)
    }
  }
  const cancelProviderHandoff = () => setProviderHandoff("idle")
  const onboardingLabels = [
    `Sign in with an EVM wallet`,
    `Account type: ${accountType}`,
    "Link your wallet",
    "Verify with Bridge",
  ]
  const titles: Record<BankDepositScreen, string> = {
    entry: "Deposit from your bank",
    onboarding: "Set up your bank deposits",
    account: `Your ${currency} deposit account`,
    preparing: "Preparing your account",
    details: `Your ${currency} deposit details`,
    tracking: "Deposit details",
  }

  return {
    screen,
    setScreen: changeScreen,
    currency,
    setCurrency: changeCurrency,
    accountType,
    setAccountType,
    onboardingStep,
    setOnboardingStep,
    railStatus,
    setRailStatus,
    accounts,
    selectedDeposit,
    setSelectedDeposit,
    status,
    setStatus,
    providerHandoff,
    providerPreviewResponse,
    setProviderPreviewResponse,
    providerAction,
    onboardingAction,
    continueOnboarding,
    previewProviderApproval,
    cancelProviderHandoff,
    preparingStep,
    setPreparingStep,
    goToAccount,
    railAvailable,
    railClosed,
    onboardingLabels,
    titles,
    variant,
    setVariant,
    v2Stage,
    setV2Stage,
    amount,
    setAmount,
  }
}

export type BankDepositFlow = ReturnType<typeof useBankDepositFlow>
