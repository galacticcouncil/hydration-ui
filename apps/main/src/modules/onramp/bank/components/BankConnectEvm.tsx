import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Button } from "@galacticcouncil/ui/components"
import { useWeb3ConnectModal, WalletMode } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import { useBankFlow } from "@/modules/onramp/bank/hooks/useBankFlow"

type BankConnectEvmProps = {
  reason: "no_account" | "not_evm" | "account_mismatch"
}

/** API doc rule 15: bank flows need an EVM wallet; a Substrate account cannot sign in. */
export const BankConnectEvm: FC<BankConnectEvmProps> = ({ reason }) => {
  const { t } = useTranslation(["onramp"])
  const { toggle } = useWeb3ConnectModal()
  const { direction } = useBankFlow()

  return (
    <BankStepShell title={t(`bank.flow.setupTitle.${direction}`)} step="verify">
      <BankMessage
        image={NoFunds}
        title={t("bank.connectEvm.title")}
        description={
          reason === "account_mismatch"
            ? t("bank.connectEvm.mismatch")
            : t("bank.connectEvm.description")
        }
        actions={
          <Button size="large" onClick={() => toggle(WalletMode.EVM)}>
            {t("bank.connectEvm.cta")}
          </Button>
        }
      />
    </BankStepShell>
  )
}
