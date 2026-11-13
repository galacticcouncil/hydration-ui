import { WalletIcon } from "@galacticcouncil/ui/assets/icons"
import { Alert, LoadingButton } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import {
  BankDirection,
  MessageSigner,
  useHbrBindWallet,
} from "@/modules/onramp/bank/hooks/useHbr"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"

type BankLinkWalletProps = {
  h160: string
  signer: MessageSigner
  /** Withdraw links a wallet to cash out from; deposit, one to receive HOLLAR in. */
  direction: BankDirection
}

/** API doc 2 step 4: bind the session's wallet to the customer. */
export const BankLinkWallet: FC<BankLinkWalletProps> = ({
  h160,
  signer,
  direction,
}) => {
  const { t } = useTranslation(["onramp"])
  const bind = useHbrBindWallet(h160, signer)

  return (
    <BankMessage
      icon={WalletIcon}
      title={t("bank.link.title")}
      description={
        direction === "withdraw"
          ? t("bank.link.description.withdraw")
          : t("bank.link.description.deposit")
      }
    >
      {bind.isError && (
        <Alert
          variant="warning"
          description={t(`bank.sign.error.${classifySignError(bind.error)}`)}
        />
      )}
      <LoadingButton
        size="large"
        isLoading={bind.isPending}
        disabled={bind.isPending}
        onClick={() => bind.mutate()}
      >
        {t("bank.link.cta")}
      </LoadingButton>
    </BankMessage>
  )
}
