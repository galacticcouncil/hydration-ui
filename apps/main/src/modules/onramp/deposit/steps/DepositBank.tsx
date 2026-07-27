import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { StepButton } from "@/modules/onramp/components/StepButton"

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
      <ModalBody>
        <StepButton
          onClick={() => window.open("https://banxa.com", "_blank")}
          title={t("bank.banxa.title")}
          description={t("bank.banxa.description")}
        />
      </ModalBody>
    </>
  )
}
