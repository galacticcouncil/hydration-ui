import BanxaLogo from "assets/icons/BanxaLogo.png"
import HarbourLogo from "assets/icons/HarbourLogo.svg"
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
      <BankTransferBox
        href="https://ramp.harbour.fi/polkadot"
        description={t("deposit.bank.harbour.description")}
        cta={t("deposit.bank.harbour.cta")}
        icon={HarbourLogo}
      />
    </SContainer>
  )
}
