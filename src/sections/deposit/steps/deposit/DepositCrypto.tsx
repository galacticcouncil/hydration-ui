import BanxaLogo from "assets/icons/BanxaLogo.png"
import HarbourLogo from "assets/icons/HarbourLogo.svg"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, SCryptoBlock } from "./DepositCrypto.styled"

type CryptoBlockProps = {
  href: string
  description: string
  cta: string
  icon: string
}

export const CryptoBlock: React.FC<CryptoBlockProps> = ({
  href,
  description,
  cta,
  icon,
}) => {
  return (
    <SCryptoBlock href={href} rel="noreferrer" target="_blank">
      <div>
        <img src={icon} height={16} alt="Banxa" sx={{ mb: 10 }} />
        <Text fs={14} color="basic400">
          {description}
        </Text>
      </div>
      <Text
        fs={[16, 14]}
        sx={{ flex: "row", align: "center" }}
        css={{ whiteSpace: "nowrap" }}
        color="brightBlue300"
      >
        {cta} <ChevronRight />
      </Text>
    </SCryptoBlock>
  )
}

export const DepositCrypto = () => {
  const { t } = useTranslation()

  return (
    <SContainer>
      <CryptoBlock
        href="https://banxa.com"
        description={t("deposit.crypto.banxa.description")}
        cta={t("deposit.crypto.banxa.buy")}
        icon={BanxaLogo}
      />
      <CryptoBlock
        href="https://ramp.harbour.fi/polkadot"
        description={t("deposit.crypto.harbour.description")}
        cta={t("deposit.crypto.harbour.buy")}
        icon={HarbourLogo}
      />
    </SContainer>
  )
}
