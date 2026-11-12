import { WalletIcon } from "@galacticcouncil/ui/assets/icons"
import { Alert, LoadingButton } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import { MessageSigner, useHbrSignIn } from "@/modules/onramp/bank/hooks/useHbr"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"

type BankSignInProps = {
  h160: string
  signer: MessageSigner
}

/** API doc 2 step 1. Signing in moves no funds, so it may be started again. */
export const BankSignIn: FC<BankSignInProps> = ({ h160, signer }) => {
  const { t } = useTranslation(["onramp"])
  const signIn = useHbrSignIn(h160, signer)

  return (
    <BankMessage
      icon={WalletIcon}
      title={t("bank.signIn.title")}
      description={t("bank.signIn.description")}
    >
      {signIn.isError && (
        <Alert
          variant="warning"
          description={t(`bank.sign.error.${classifySignError(signIn.error)}`)}
        />
      )}
      <LoadingButton
        size="large"
        isLoading={signIn.isPending}
        disabled={signIn.isPending}
        onClick={() => signIn.mutate()}
      >
        {t("bank.signIn.cta")}
      </LoadingButton>
    </BankMessage>
  )
}
