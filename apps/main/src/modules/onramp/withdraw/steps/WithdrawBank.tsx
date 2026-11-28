import { ModalBody, ModalHeader, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { StepButton } from "@/modules/onramp/components/StepButton"
import { useOnrampClosable } from "@/modules/onramp/hooks/useOnrampClosable"

export type WithdrawBankProps = {
  onBack: () => void
}

export const WithdrawBank: React.FC<WithdrawBankProps> = ({ onBack }) => {
  const { t } = useTranslation(["onramp"])
  const closable = useOnrampClosable()

  return (
    <>
      <ModalHeader
        title={t("withdraw.bank.title")}
        align="center"
        onBack={onBack}
        closable={closable}
      />
      <ModalBody>
        <Stack gap="m">
          <StepButton
            onClick={() =>
              window.open("https://app.vortexfinance.co", "_blank")
            }
            title={t("bank.vortex.title")}
            description={t("bank.vortex.description")}
          />
        </Stack>
      </ModalBody>
    </>
  )
}
