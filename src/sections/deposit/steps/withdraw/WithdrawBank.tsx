import VortexLogo from "assets/icons/VortexLogo.svg"
import { useTranslation } from "react-i18next"
import { SContainer } from "./WithdrawBank.styled"
import { BankTransferBox } from "sections/deposit/components/BankTransferBox"

export const WithdrawBank = () => {
  const { t } = useTranslation()

  return (
    <SContainer>
      <BankTransferBox
        href="https://app.vortexfinance.co"
        description={t("withdraw.bank.vortex.description")}
        cta={t("withdraw.bank.vortex.cta")}
        icon={VortexLogo}
      />
    </SContainer>
  )
}
