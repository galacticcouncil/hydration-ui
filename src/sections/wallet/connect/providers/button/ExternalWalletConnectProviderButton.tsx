import ChevronRight from "assets/icons/ChevronRight.svg?react"
import ExternalWalletIcon from "assets/icons/ExternalWalletIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SWalletButton } from "sections/wallet/connect/providers/WalletConnectProviders.styled"

export const ExternalWalletConnectProviderButton = ({
  onClick,
}: {
  onClick: () => void
}) => {
  const { t } = useTranslation()
  return (
    <SWalletButton onClick={onClick}>
      <div sx={{ bg: "basic900", p: 7 }} css={{ borderRadius: "9999px" }}>
        <Icon icon={<ExternalWalletIcon />} />
      </div>
      <Text fs={18} css={{ flexGrow: 1 }}>
        {t("walletConnect.externalWallet")}
      </Text>
      <Icon sx={{ color: "brightBlue300" }} icon={<ChevronRight />} />
    </SWalletButton>
  )
}
