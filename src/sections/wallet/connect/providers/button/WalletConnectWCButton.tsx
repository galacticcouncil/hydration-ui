import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SWalletButton } from "../WalletConnectProviders.styled"

type Props = { onClick: () => void }

export const WalletConnectWCButton = ({ onClick }: Props) => {
  const { t } = useTranslation()

  return (
    <SWalletButton onClick={onClick}>
      <img src="" alt={t("walletConnect.wc")} width={40} height={40} />
      <Text fs={18} css={{ flexGrow: 1 }}>
        {t("walletConnect.wc")}
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
