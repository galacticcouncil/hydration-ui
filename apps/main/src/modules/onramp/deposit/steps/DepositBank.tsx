import { ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"

export type DepositBankProps = {
  onBack: () => void
}

export const DepositBank: React.FC<DepositBankProps> = ({ onBack }) => {
  const { t } = useTranslation(["onramp"])

  return (
    <>
      <ModalHeader
        title={t("deposit.bank.title")}
        align="center"
        onBack={onBack}
        closable={false}
      />
      <BankFlow direction="deposit" />
    </>
  )
}
