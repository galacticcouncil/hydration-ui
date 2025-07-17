import BanxaLogo from "assets/icons/BanxaLogo.png"
import { useTranslation } from "react-i18next"
import { BankTransferBox } from "sections/deposit/components/BankTransferBox"
import { SContainer } from "./DepositBank.styled"

export const DepositBank = () => {
  const { t } = useTranslation()

  return (
    <SContainer>
      <BankTransferBox
        href="https://banxa.com"
        description={t("deposit.bank.banxa.description")}
        cta={t("deposit.bank.banxa.cta")}
        icon={BanxaLogo}
      />
    </SContainer>
  )
}
