import Bank3D from "@galacticcouncil/ui/assets/images/Bank3D.webp"
import { Button } from "@galacticcouncil/ui/components"
import { useWeb3ConnectModal, WalletMode } from "@galacticcouncil/web3-connect"
import { Link } from "@tanstack/react-router"
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
        image={Bank3D}
        title={t("bank.connectEvm.title")}
        description={
          reason === "account_mismatch"
            ? t("bank.connectEvm.mismatch")
            : t("bank.connectEvm.description")
        }
        actions={
          <>
            <Button size="large" onClick={() => toggle(WalletMode.EVM)}>
              {t("bank.connectEvm.cta")}
            </Button>
            {import.meta.env.VITE_PORTFOLIO_SAMPLES === "1" && (
              <Button size="large" variant="tertiary" asChild>
                <Link to="/portfolio/deposits" search={{ bankDemo: direction }}>
                  Try without a wallet
                </Link>
              </Button>
            )}
          </>
        }
      />
    </BankStepShell>
  )
}
