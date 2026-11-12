import {
  Flex,
  ModalBody,
  Skeleton,
  Stack,
  TextButton,
} from "@galacticcouncil/ui/components"
import { FC, useEffect } from "react"
import { useTranslation } from "react-i18next"

import { BankAccountType } from "@/modules/onramp/bank/components/BankAccountType"
import { BankErrorMessage } from "@/modules/onramp/bank/components/BankErrorMessage"
import { BankLinkWallet } from "@/modules/onramp/bank/components/BankLinkWallet"
import { BankReady } from "@/modules/onramp/bank/components/BankReady"
import { BankVerify } from "@/modules/onramp/bank/components/BankVerify"
import {
  MessageSigner,
  useHbrMe,
  useHbrOnboarding,
  useHbrSignOut,
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
}

/** API doc 2 steps 2-5, each screen derived from the latest onboarding read. */
export const BankOnboarding: FC<BankOnboardingProps> = ({ h160, signer }) => {
  const { t } = useTranslation(["onramp"])
  const me = useHbrMe(h160)
  const onboarding = useHbrOnboarding(h160)
  const signOut = useHbrSignOut(h160)
  const clear = useHbrSessionStore((state) => state.clear)

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

  return (
    <>
      {step.kind === "loading" && (
        <ModalBody>
          <Stack gap="m">
            <Skeleton height={48} />
            <Skeleton height={48} />
          </Stack>
        </ModalBody>
      )}
      {step.kind === "error" && (
        <BankErrorMessage
          error={step.error}
          onRetry={() => {
            void me.refetch()
            void onboarding.refetch()
          }}
        />
      )}
      {step.kind === "chooseType" && <BankAccountType h160={h160} />}
      {step.kind === "bind" && <BankLinkWallet h160={h160} signer={signer} />}
      {step.kind === "verify" && (
        <BankVerify
          step={step}
          isChecking={onboarding.isFetching}
          onCheck={() => void onboarding.refetch()}
        />
      )}
      {step.kind === "ready" && <BankReady rails={step.rails} />}
      <Flex justify="center" pb="l">
        <TextButton
          disabled={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          {t("bank.signOut")}
        </TextButton>
      </Flex>
    </>
  )
}
