import { WalletIcon } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import { useWeb3ConnectModal, WalletMode } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"

type BankConnectEvmProps = {
  reason: "no_account" | "not_evm" | "account_mismatch"
}

/** API doc rule 15: bank flows need an EVM wallet; a Substrate account cannot sign in. */
export const BankConnectEvm: FC<BankConnectEvmProps> = ({ reason }) => {
  const { t } = useTranslation(["onramp"])
  const { toggle } = useWeb3ConnectModal()

  return (
    <BankMessage
      icon={WalletIcon}
      title={t("bank.connectEvm.title")}
      description={
        reason === "account_mismatch"
          ? t("bank.connectEvm.mismatch")
          : t("bank.connectEvm.description")
      }
    >
      <Button size="large" onClick={() => toggle(WalletMode.EVM)}>
        {t("bank.connectEvm.cta")}
      </Button>
    </BankMessage>
  )
}
