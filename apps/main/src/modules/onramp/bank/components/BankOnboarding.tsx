import SuccessStatus from "@galacticcouncil/ui/assets/images/SuccessStatus.webp"
import {
  Button,
  ModalBody,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankAccounts } from "@/modules/onramp/bank/components/BankAccounts"
import { BankAccountType } from "@/modules/onramp/bank/components/BankAccountType"
import { BankDeposit } from "@/modules/onramp/bank/components/BankDeposit"
import { BankErrorMessage } from "@/modules/onramp/bank/components/BankErrorMessage"
import { BankLinkWallet } from "@/modules/onramp/bank/components/BankLinkWallet"
import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import { BankVerify } from "@/modules/onramp/bank/components/BankVerify"
import { useBankFlow } from "@/modules/onramp/bank/hooks/useBankFlow"
import {
  BankDirection,
  MessageSigner,
  useHbrMe,
  useHbrOnboarding,
} from "@/modules/onramp/bank/hooks/useHbr"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import {
  classifyBankError,
  deriveOnboardingStep,
} from "@/modules/onramp/bank/utils/onboarding"

type BankOnboardingProps = {
  /** The connected wallet: every query key and token below is bound to it. */
  h160: string
  signer: MessageSigner
  direction: BankDirection
}

/**
 * API doc 2 steps 2-5 as the Figma set-up steps S02-S07, each screen derived
 * from the latest onboarding read. No sign-out here (owner decision
 * 2026-11-13). The session ends locally on a wallet disconnect or change
 * (HbrSessionGuard, mounted at the app root, with or without a bank screen),
 * on a 401 for its token, and when its expiry has passed on a read back from
 * sessionStorage; closing the tab ends sessionStorage. On the guard's clear
 * the server token is revoked best effort (one DELETE, outcome ignored); on a
 * 401 or an expiry there is nothing left to revoke.
 */
export const BankOnboarding: FC<BankOnboardingProps> = ({
  h160,
  signer,
  direction,
}) => {
  const { t } = useTranslation(["onramp"])
  const me = useHbrMe(h160)
  const onboarding = useHbrOnboarding(h160)
  const clear = useHbrSessionStore((state) => state.clear)
  const { onClose } = useBankFlow()

  // The server's wallet of this session must be this wallet.
  const meWallet = me.data?.h160.toLowerCase()
  useEffect(() => {
    if (meWallet && meWallet !== h160) clear()
  }, [meWallet, h160, clear])

  const step =
    me.error && classifyBankError(me.error) === "support"
      ? ({ kind: "error", error: "support" } as const)
      : deriveOnboardingStep({
          data: onboarding.data,
          error: onboarding.error,
        })

  // S07 ("ready") is shown once, when this screen saw the set-up unfinished
  // and the server then opened a rail; a user already set up goes straight on.
  // Display state only: the next screen is still the server's.
  const [sawSetup, setSawSetup] = useState(false)
  const [readySeen, setReadySeen] = useState(false)
  const inSetup =
    step.kind === "chooseType" || step.kind === "bind" || step.kind === "verify"
  useEffect(() => {
    if (inSetup) setSawSetup(true)
  }, [inSetup])

  if (step.kind === "loading")
    return (
      <BankStepShell title={t(`bank.flow.setupTitle.${direction}`)} step={null}>
        <ModalBody>
          <Stack gap="m">
            <Skeleton height={48} />
            <Skeleton height={48} />
          </Stack>
        </ModalBody>
      </BankStepShell>
    )
  if (step.kind === "error")
    return (
      <BankStepShell title={t(`bank.flow.setupTitle.${direction}`)} step={null}>
        <BankErrorMessage
          error={step.error}
          onRetry={() => {
            void me.refetch()
            void onboarding.refetch()
          }}
        />
      </BankStepShell>
    )
  if (step.kind === "chooseType") return <BankAccountType h160={h160} />
  if (step.kind === "bind")
    return <BankLinkWallet h160={h160} signer={signer} direction={direction} />
  if (step.kind === "verify")
    return (
      <BankVerify
        step={step}
        isChecking={onboarding.isFetching}
        onCheck={() => void onboarding.refetch()}
      />
    )

  if (sawSetup && !readySeen)
    return (
      <BankStepShell title={t("bank.flow.statusTitle")} step="verify">
        <BankMessage
          image={SuccessStatus}
          title={t(`bank.ready.title.${direction}`)}
          description={t(`bank.ready.description.${direction}`)}
          actions={
            <>
              <Button size="large" onClick={() => setReadySeen(true)}>
                {t(`bank.ready.cta.${direction}`)}
              </Button>
              {onClose && (
                <Button size="large" variant="tertiary" onClick={onClose}>
                  {t("bank.flow.backToPortfolio")}
                </Button>
              )}
            </>
          }
        />
      </BankStepShell>
    )

  return direction === "deposit" ? (
    <BankDeposit h160={h160} />
  ) : (
    <BankAccounts h160={h160} rails={step.rails} />
  )
}
