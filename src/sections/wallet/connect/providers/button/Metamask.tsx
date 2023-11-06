import ChevronRight from "assets/icons/ChevronRight.svg?react"
import MetamaskLogo from "assets/icons/Metamask.svg?react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SWalletButton } from "sections/wallet/connect/providers/WalletConnectProviders.styled"
import { Icon } from "components/Icon/Icon"

type Props = { onClick: () => void }

export const Metamask = ({ onClick }: Props) => {
  const { t } = useTranslation()

  return (
    <SWalletButton onClick={onClick}>
      <Icon size={40} icon={<MetamaskLogo />} />

      <Text fs={18} css={{ flexGrow: 1 }}>
        Metamask
      </Text>

      <Text
        color="brightBlue300"
        fs={14}
        tAlign="right"
        sx={{ flex: "row", align: "center", gap: 4 }}
      >
        {t("walletConnect.provider.continue")}
        <ChevronRight />
      </Text>
    </SWalletButton>
  )
}
