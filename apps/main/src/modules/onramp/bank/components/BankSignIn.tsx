import { CircleAlertIcon, WalletIcon } from "@galacticcouncil/ui/assets/icons"
import { Alert, Button } from "@galacticcouncil/ui/components"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import { useBankFlow } from "@/modules/onramp/bank/hooks/useBankFlow"
import {
  MessageSigner,
  useHbrActionInFlight,
  useHbrSignIn,
} from "@/modules/onramp/bank/hooks/useHbr"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"

// Which opening of the flow already asked this wallet to sign in (memory
// only): the automatic prompt runs once per open and wallet, never again on a
// StrictMode re-run, a remount inside the same open, or a wallet switch back.
const autoStarted = new Map<string, number>()

/** Test-only: forget which opens already prompted. */
export const resetAutoSignIn = () => autoStarted.clear()

type BankSignInProps = {
  h160: string
  signer: MessageSigner
}

/**
 * API doc 2 step 1 without a separate step (owner decision 2026-11-14):
 * opening the bank flow asks the wallet to sign in at once. At most one
 * personal_sign per user action: the open itself, or an explicit Try again.
 * A sign-in already in flight for this wallet (the modal reopened while the
 * wallet prompt is open) starts nothing. Signing in moves no funds.
 */
export const BankSignIn: FC<BankSignInProps> = ({ h160, signer }) => {
  const { t } = useTranslation(["onramp"])
  const signIn = useHbrSignIn(h160, signer)
  const inFlight = useHbrActionInFlight(h160, "signIn")
  const { direction, openId = 0 } = useBankFlow()
  const [asked, setAsked] = useState(() => autoStarted.get(h160) === openId)

  useEffect(() => {
    if (autoStarted.get(h160) === openId) return
    autoStarted.set(h160, openId)
    setAsked(true)
    if (inFlight.isFree()) signIn.mutate()
    // Once per open and wallet: the map is the guard, not the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h160, openId])

  const start = () => {
    if (inFlight.isFree()) signIn.mutate()
  }
  const pending = signIn.isPending || inFlight.pending || !asked
  const title = t(`bank.flow.setupTitle.${direction}`)

  if (pending)
    return (
      <BankStepShell title={title} step="verify">
        <BankMessage
          icon={WalletIcon}
          title={t("bank.signIn.pending.title")}
          description={t("bank.signIn.pending.description")}
        />
      </BankStepShell>
    )

  return (
    <BankStepShell title={title} step="verify">
      <BankMessage
        icon={signIn.isError ? CircleAlertIcon : WalletIcon}
        title={
          signIn.isError
            ? t("bank.signIn.failed.title")
            : t("bank.signIn.title")
        }
        description={t("bank.signIn.description")}
        actions={
          <Button size="large" onClick={start}>
            {signIn.isError ? t("bank.signIn.retry") : t("bank.signIn.cta")}
          </Button>
        }
      >
        {signIn.isError && (
          <Alert
            variant="warning"
            description={t(
              `bank.sign.error.${classifySignError(signIn.error)}`,
            )}
          />
        )}
      </BankMessage>
    </BankStepShell>
  )
}
