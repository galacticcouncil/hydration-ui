import { ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"

export type WithdrawBankProps = {
  onBack: () => void
}

export const WithdrawBank: React.FC<WithdrawBankProps> = ({ onBack }) => {
  const { t } = useTranslation(["onramp"])

  return (
    <>
      <ModalHeader
        title={t("withdraw.bank.title")}
        align="center"
        onBack={onBack}
        closable={false}
      />
      <BankFlow direction="withdraw" />
    </>
  )
}
