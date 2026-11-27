import {
  CheckIcon,
  ChevronRightIcon,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import Bank3D from "@galacticcouncil/ui/assets/images/Bank3D.webp"
import BankBusiness from "@galacticcouncil/ui/assets/images/BankBusiness.png"
import BankIndividual from "@galacticcouncil/ui/assets/images/BankIndividual.png"
import ReviewClock3D from "@galacticcouncil/ui/assets/images/ReviewClock3D.webp"
import {
  Alert,
  Box,
  Button,
  Chip,
  Flex,
  Icon,
  Image,
  Input,
  ModalBody,
  ModalFooter,
  OptionCard,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { USDC_ASSET_ID } from "@galacticcouncil/utils"
import { useState } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import {
  buildFixtureQuote,
  FIXTURE_ADDRESS,
  FIXTURE_ONRAMP_VIEWS,
} from "@/modules/onramp/bank/config/fixtures"
import {
  BankFlowContext,
  type BankStepKey,
} from "@/modules/onramp/bank/hooks/useBankFlow"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

import { bankCashOutAmountSchema } from "./BankCashOut.form"
import { BankCashOutQuote } from "./BankCashOutQuote"
import { BankDepositInstructions } from "./BankDepositInstructions"
import { BankDepositPreviewAmount } from "./BankDepositPreviewAmount"
import { BankDepositSampleReceipt } from "./BankDepositSampleReceipt"
import { BankMessage } from "./BankMessage"
import { BankStepShell } from "./BankStepShell"
import { BankTimeline } from "./BankTimeline"
import {
  BankWithdrawalReceipt,
  BankWithdrawalSummary,
} from "./BankWithdrawalReceipt"

type Direction = "deposit" | "withdraw"
type Stage =
  | "depositAmount"
  | "entry"
  | "accountType"
  | "walletSignIn"
  | "walletLink"
  | "bankLink"
  | "bankLinkReview"
  | "setup"
  | "bridgeReturn"
  | "verification"
  | "amount"
  | "account"
  | "details"
  | "review"
  | "pending"
  | "complete"

const stages: Record<Direction, readonly Stage[]> = {
  deposit: ["details", "pending", "complete"],
  withdraw: ["amount", "account", "review", "pending", "complete"],
}
const firstTimeSetup: Stage[] = [
  "walletSignIn",
  "accountType",
  "walletLink",
  "setup",
  "bridgeReturn",
  "verification",
]

const stepKeys: Record<Stage, BankStepKey | null> = {
  depositAmount: "amount",
  entry: null,
  accountType: null,
  walletSignIn: null,
  walletLink: null,
  bankLink: "bankAccount",
  bankLinkReview: "bankAccount",
  setup: "verify",
  bridgeReturn: null,
  verification: "verify",
  amount: "amount",
  account: "bankAccount",
  details: "bankDetails",
  review: "review",
  pending: "transfer",
  complete: "transfer",
}
const depositSteps = ["amount", "verify", "bankDetails", "transfer"] as const
const accounts = [
  {
    key: "usd",
    label: "USD checking ··1234",
    bank: "Demo US bank",
    rail: "USD · ACH",
  },
  {
    key: "eur",
    label: "EUR account ··5678",
    bank: "Demo EU bank",
    rail: "EUR · SEPA",
  },
] as const
type Currency = (typeof accounts)[number]["key"]

const setupMessages = {
  walletSignIn: {
    title: "Start with your wallet",
    description: "Simulate signing in with a Hydration wallet.",
  },
  walletLink: {
    title: "Link your wallet",
    description:
      "Simulate signing a separate message to link your wallet to Bridge.",
  },
  setup: {
    title: "Verify with Bridge",
    description: "Bridge handles identity or business verification.",
  },
  bridgeReturn: {
    title: "Continue on Bridge",
    description:
      "This simulates the verification handoff and return to Hydration.",
  },
  verification: {
    title: "Verification in review",
    description: "Simulate approval to continue to bank transfers.",
  },
}

function WithdrawalAsset({ asset }: { asset: "HOLLAR" | "USDC" }) {
  return (
    <Flex align="center" gap="s" sx={{ flexShrink: 0 }}>
      {asset === "HOLLAR" ? (
        <img src="/images/bank-hollar.svg" width={26} height={26} alt="" />
      ) : (
        <AssetLogo id={USDC_ASSET_ID} size="small" hideChain />
      )}
      <Text fs="p4" fw={600}>
        {asset}
      </Text>
    </Flex>
  )
}

/** Preview-only state. No session, signing hooks or bank service calls. */
export function BankWalkthrough({
  direction,
  onClose,
}: {
  direction: Direction
  onClose: () => void
}) {
  const { gte } = useBreakpoints()
  const [index, setIndex] = useState(0)
  const [currency, setCurrency] = useState<Currency>("usd")
  const [amount, setAmount] = useState("100")
  const [depositAmount, setDepositAmount] = useState("500")
  const [firstTime, setFirstTime] = useState(true)
  const [accountType, setAccountType] = useState<"individual" | "business">(
    "individual",
  )
  const [linked, setLinked] = useState<Currency[]>([])
  const [bankLinkStage, setBankLinkStage] = useState<
    "bankLink" | "bankLinkReview" | null
  >(null)
  const [bankToLink, setBankToLink] = useState<Currency>("usd")
  const flow =
    direction === "withdraw"
      ? [
          "entry" as const,
          ...(firstTime ? firstTimeSetup : []),
          ...stages.withdraw,
        ]
      : ["depositAmount" as const, ...firstTimeSetup, ...stages.deposit]
  const stage = bankLinkStage ?? flow[index]!
  const deposit = direction === "deposit"
  const title = deposit ? "Bank deposit demo" : "Bank withdrawal demo"
  const next = () => setIndex((i) => Math.min(i + 1, flow.length - 1))
  const back = () => {
    if (bankLinkStage === "bankLinkReview") setBankLinkStage("bankLink")
    else if (bankLinkStage) setBankLinkStage(null)
    else if (index === 0) onClose()
    else setIndex((i) => i - 1)
  }
  const parsed = bankCashOutAmountSchema.safeParse({ usdcAmount: amount })
  const quote = parsed.success
    ? buildFixtureQuote(parsed.data.usdcAmount)
    : null
  const details = FIXTURE_ONRAMP_VIEWS.ready(currency)
  const selectedAccount = accounts.find((a) => a.key === currency)!.label
  const previewBank = accounts.find((a) => a.key === bankToLink)!
  const savedAccounts = firstTime
    ? accounts.filter(({ key }) => linked.includes(key))
    : accounts
  const unlinkedAccounts = accounts.filter(
    ({ key }) => !savedAccounts.some((account) => account.key === key),
  )
  const setupMessage =
    stage in setupMessages
      ? setupMessages[stage as keyof typeof setupMessages]
      : undefined
  const timeline = [
    "Redeemed on Hydration",
    "Queued on Base",
    "Delivered to Bridge",
    "Processing at Bridge",
    "Bank payout submitted",
    "Paid",
  ]
  const payout = quote
    ? (formatUsdcBaseUnits(quote.quote.bridgeCredited) ?? "–") + " USDC"
    : "–"
  const withdrawalSource = `From ${amount} HOLLAR · Wallet ${FIXTURE_ADDRESS.slice(0, 6)}…${FIXTURE_ADDRESS.slice(-4)}`
  const complete = stage === "complete"
  const receipt = stage === "pending" || complete
  const labels: Record<Stage, string> = {
    depositAmount: "Continue",
    entry: "Start setup",
    accountType: "Continue",
    walletSignIn: "Simulate wallet sign-in",
    walletLink: "Simulate wallet link",
    bankLink: "Continue",
    bankLinkReview: "Link bank account",
    setup: "Simulate opening Bridge",
    bridgeReturn: "Return to Hydration",
    verification: "Simulate approval",
    amount: "Continue",
    account: "Review withdrawal",
    details: "Simulate deposit",
    review: "Simulate withdrawal",
    pending: deposit ? "Simulate credit" : "Simulate payout",
    complete: "Done",
  }
  const stageActions: Partial<Record<Stage, () => void>> = {
    bankLink: () => setBankLinkStage("bankLinkReview"),
    bankLinkReview: () => {
      setLinked((current) => [...current, bankToLink])
      setCurrency(bankToLink)
      setBankLinkStage(null)
    },
    complete: onClose,
  }
  const screenTitles: Partial<Record<Stage, string>> = {
    accountType: "Choose an account type",
    amount: "Withdraw to your bank",
    depositAmount: "Deposit from your bank",
    account: "Choose a bank account",
    review: "Withdraw to your bank",
    bankLink: "Choose a bank",
    bankLinkReview: "Link a bank account",
  }
  const action = (
    <Button
      size="large"
      width="100%"
      variant={
        (stage === "amount" || stage === "review") && gte("sm")
          ? "secondary"
          : "primary"
      }
      disabled={
        (stage === "amount" && !quote) ||
        (stage === "account" &&
          !deposit &&
          (!quote || !savedAccounts.some(({ key }) => key === currency)))
      }
      onClick={stageActions[stage] ?? next}
    >
      {labels[stage]}
    </Button>
  )
  return (
    <BankFlowContext.Provider value={{ direction, onClose, onExit: onClose }}>
      <BankStepShell
        title={
          receipt
            ? deposit
              ? complete
                ? "Deposit credited"
                : "Deposit processing"
              : complete
                ? "Withdrawal paid"
                : "Withdrawal processing"
            : (screenTitles[stage] ?? title)
        }
        description="Interactive demo · No funds move"
        steps={deposit ? depositSteps : undefined}
        step={
          deposit && firstTimeSetup.includes(stage)
            ? "verify"
            : !deposit && (stage === "setup" || stage === "verification")
              ? null
              : stepKeys[stage]
        }
        onBack={back}
      >
        {stage === "depositAmount" ? (
          <BankDepositPreviewAmount
            amount={depositAmount}
            currency={currency}
            onAmount={setDepositAmount}
            onCurrency={setCurrency}
            onContinue={next}
          />
        ) : stage === "amount" ? (
          <>
            <ModalBody noPadding>
              <Stack p="var(--modal-content-padding)" gap="base">
                <Flex align="center" justify="space-between" gap="s">
                  <label htmlFor="sample-withdrawal-amount">
                    <Text as="span" fs="p5" color={getToken("text.medium")}>
                      Amount to withdraw
                    </Text>
                  </label>
                  <Text
                    id="sample-withdrawal-balance"
                    fs="p5"
                    fw={500}
                    color={getToken("text.low")}
                    sx={{ textAlign: "right" }}
                  >
                    Balance: 1,250 HOLLAR
                  </Text>
                </Flex>
                <Flex align="center" gap="m">
                  <WithdrawalAsset asset="HOLLAR" />
                  <Box
                    flex={1}
                    sx={{
                      minWidth: 0,
                      "& input": {
                        textAlign: "right",
                        fontSize: "p2",
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Input
                      id="sample-withdrawal-amount"
                      variant="embedded"
                      width="100%"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      inputMode="decimal"
                      maxLength={30}
                      aria-describedby="sample-withdrawal-balance"
                      aria-invalid={!quote}
                    />
                  </Box>
                </Flex>
                {!quote && (
                  <Text fs="p5" role="status">
                    Enter a valid HOLLAR amount that leaves at least 2 USDC
                    after fees.
                  </Text>
                )}
              </Stack>
              <Separator />
              <Stack p="var(--modal-content-padding)" gap="base">
                <Text
                  font="primary"
                  fs="p2"
                  color={getToken("textButtons.small.rest")}
                >
                  You receive (est.)
                </Text>
                <Flex
                  align="center"
                  justify="space-between"
                  gap="m"
                  py="m"
                  pl="base"
                  pr="m"
                  sx={{
                    minHeight: 70,
                    borderRadius: "m",
                    bg: getToken("surfaces.containers.dim.dimOnHigh"),
                  }}
                >
                  <WithdrawalAsset asset="USDC" />
                  <Text fs="p2" fw={600} aria-live="polite">
                    {quote
                      ? formatUsdcBaseUnits(quote.quote.bridgeCredited)
                      : "—"}
                  </Text>
                </Flex>
                <Text fs="p6" color={getToken("text.low")}>
                  Estimate before bank conversion.
                </Text>
              </Stack>
              <Separator />
              <Box
                p="var(--modal-content-padding)"
                sx={{
                  "& > button": {
                    bg: getToken("surfaces.containers.dim.dimOnHigh"),
                    borderColor: "transparent",
                    "&:hover:not(:disabled)": {
                      bg: getToken("details.separators"),
                    },
                  },
                }}
              >
                <OptionCard
                  icon={LandmarkIcon}
                  label="Destination bank"
                  description={
                    savedAccounts.some(({ key }) => key === currency)
                      ? selectedAccount
                      : "Choose or add a bank account"
                  }
                  value={<ChevronRightIcon />}
                  isActive={false}
                  onClick={next}
                />
              </Box>
            </ModalBody>
            <Separator />
            <ModalFooter>{action}</ModalFooter>
          </>
        ) : stage === "entry" ? (
          <>
            <ModalBody>
              <Stack gap="m">
                <OptionCard
                  icon={LandmarkIcon}
                  label="Set up bank withdrawals"
                  description="Try first-time verification and link a demo bank account."
                  value=""
                  isActive={false}
                  onClick={() => {
                    setFirstTime(true)
                    setLinked([])
                    setCurrency("usd")
                    next()
                  }}
                />
                <OptionCard
                  icon={LandmarkIcon}
                  label="Use a saved bank account"
                  description="Skip setup and choose a saved demo account."
                  value=""
                  isActive={false}
                  onClick={() => {
                    setFirstTime(false)
                    setLinked([])
                    setCurrency("usd")
                    next()
                  }}
                />
              </Stack>
            </ModalBody>
          </>
        ) : setupMessage ? (
          <BankMessage
            image={stage === "verification" ? ReviewClock3D : Bank3D}
            {...setupMessage}
            actions={action}
          />
        ) : stage === "bankLinkReview" ? (
          <BankMessage
            image={Bank3D}
            title={previewBank.bank}
            description={`${previewBank.label} · ${previewBank.rail}`}
            actions={action}
          >
            <Alert
              variant="info"
              description="Bank details are prefilled for this demo."
            />
          </BankMessage>
        ) : receipt ? (
          <>
            {deposit ? (
              <BankDepositSampleReceipt
                currency={currency}
                amount={depositAmount}
                complete={complete}
              />
            ) : (
              <BankWithdrawalReceipt
                label={
                  complete
                    ? "Payout sent before bank conversion"
                    : "Estimated payout before bank conversion"
                }
                amount={payout}
                source={withdrawalSource}
                account={selectedAccount}
                notice={
                  <Alert
                    displayIcon={false}
                    variant={complete ? "success" : "info"}
                    description={
                      complete
                        ? "Your demo withdrawal has been paid."
                        : "Your withdrawal is on its way. Do not submit it again."
                    }
                  />
                }
              >
                <BankTimeline
                  key={stage}
                  stages={timeline}
                  lit={complete ? 6 : 4}
                  complete={complete}
                  current={{
                    label: timeline[complete ? 5 : 3]!,
                    detail: complete
                      ? undefined
                      : "Bridge is preparing your bank payout.",
                  }}
                />
              </BankWithdrawalReceipt>
            )}
            <ModalFooter>{action}</ModalFooter>
          </>
        ) : (
          <>
            <ModalBody
              maxHeight={
                stage === "review"
                  ? [
                      "none",
                      "max(8rem, calc(100dvh - var(--modal-top-content-height) - 16rem))",
                    ]
                  : undefined
              }
            >
              <Stack gap="l">
                {stage === "accountType" &&
                  (["individual", "business"] as const).map((type) => (
                    <OptionCard
                      key={type}
                      icon={
                        <Image
                          src={
                            type === "individual"
                              ? BankIndividual
                              : BankBusiness
                          }
                          alt=""
                          sx={{ width: 48, height: 48, flexShrink: 0 }}
                        />
                      }
                      label={type === "individual" ? "Individual" : "Business"}
                      description={
                        type === "individual"
                          ? "A bank account in your own name."
                          : "A company bank account."
                      }
                      value={
                        accountType === type && (
                          <Icon component={CheckIcon} size="m" aria-hidden />
                        )
                      }
                      isActive={accountType === type}
                      onClick={() => setAccountType(type)}
                    />
                  ))}
                {stage === "bankLink" &&
                  unlinkedAccounts.map(({ key, bank, rail }) => (
                    <OptionCard
                      key={key}
                      icon={LandmarkIcon}
                      label={bank}
                      description={rail}
                      value={
                        bankToLink === key && (
                          <Icon component={CheckIcon} size="m" aria-hidden />
                        )
                      }
                      isActive={bankToLink === key}
                      onClick={() => setBankToLink(key)}
                    />
                  ))}
                {stage === "account" && !deposit && (
                  <Stack gap="m">
                    {savedAccounts.length > 0 && (
                      <Text fs="p5">Saved accounts</Text>
                    )}
                    {savedAccounts.map(({ key, label, bank, rail }) => (
                      <OptionCard
                        key={key}
                        icon={LandmarkIcon}
                        label={label}
                        description={`${bank} · ${rail}`}
                        value={
                          <Flex align="center" gap="s">
                            <Chip variant="green" size="small">
                              Confirmed
                            </Chip>
                            {currency === key && (
                              <Icon
                                component={CheckIcon}
                                size="m"
                                aria-hidden
                              />
                            )}
                          </Flex>
                        }
                        isActive={currency === key}
                        onClick={() => setCurrency(key)}
                      />
                    ))}
                    {unlinkedAccounts.length > 0 && (
                      <OptionCard
                        icon={LandmarkIcon}
                        label={
                          savedAccounts.length
                            ? "Add another bank account"
                            : "Add a bank account"
                        }
                        description="Choose a bank and link a demo account."
                        value=""
                        isActive={false}
                        onClick={() => {
                          setBankToLink(unlinkedAccounts[0]!.key)
                          setBankLinkStage("bankLink")
                        }}
                      />
                    )}
                  </Stack>
                )}
                {stage === "details" && (
                  <BankDepositInstructions
                    currency={currency}
                    instructions={details.instructions}
                    minimumDeposit={details.minimumDeposit}
                    wallet={FIXTURE_ADDRESS}
                  />
                )}
                {stage === "review" && quote && (
                  <>
                    <BankWithdrawalSummary
                      label="Estimated payout before bank conversion"
                      amount={payout}
                      source={withdrawalSource}
                      account={selectedAccount}
                    />
                    <BankCashOutQuote
                      pricing={quote}
                      currency={currency}
                      sourceAsset="HOLLAR"
                      account={selectedAccount}
                    />
                  </>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter>{action}</ModalFooter>
          </>
        )}
      </BankStepShell>
    </BankFlowContext.Provider>
  )
}
