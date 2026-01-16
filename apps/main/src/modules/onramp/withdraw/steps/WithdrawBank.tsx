import { ModalBody, ModalHeader, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { BankTransferBox } from "@/modules/onramp/components/BankTransferBox"

// Import Vortex logo when available
const VortexLogo = "/assets/vortex-logo.svg"

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
        <Stack gap={12}>
          <BankTransferBox
            href="https://app.vortexfinance.co"
            description={t("withdraw.bank.vortex.description")}
            cta={t("withdraw.bank.vortex.cta")}
            icon={VortexLogo}
          />
        </Stack>
      </ModalBody>
    </>
  )
}
