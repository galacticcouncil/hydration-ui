import { ModalBody, ModalHeader, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { StepButton } from "@/modules/onramp/components/StepButton"

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
      <ModalBody>
        <Stack gap="m">
          <StepButton
            onClick={() =>
              window.open("https://app.vortexfinance.co", "_blank")
            }
            title="Vortex"
            description={t("withdraw.bank.vortex.description")}
          />
        </Stack>
      </ModalBody>
    </>
  )
}
