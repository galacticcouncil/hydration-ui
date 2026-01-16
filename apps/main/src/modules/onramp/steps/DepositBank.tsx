import { ModalBody, ModalHeader, Stack } from "@galacticcouncil/ui/components"
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
        <Stack gap={12}>
          <StepButton
            onClick={() => window.open("https://banxa.com", "_blank")}
            title="Banxa"
            description={t("deposit.bank.banxa.description")}
          />
        </Stack>
      </ModalBody>
    </>
  )
}
