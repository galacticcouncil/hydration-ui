import { SWalletButton } from "sections/wallet/connect/providers/WalletConnectProviders.styled"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { ReactComponent as DownloadIcon } from "assets/icons/DownloadIcon.svg"
import { useTranslation } from "react-i18next"
import { Wallet } from "@talismn/connect-wallets"

type Props = {
  wallet: Wallet
  onClick: () => void
  isInjected: boolean
}

export const WalletConnectProvidersButton = ({
  wallet,
  onClick,
  isInjected,
}: Props) => {
  const { t } = useTranslation()

  return (
    <SWalletButton onClick={onClick} variant={wallet.extensionName}>
      <img src={wallet.logo.src} alt={wallet.logo.alt} width={40} height={40} />
      <Text fs={18} css={{ flexGrow: 1 }}>
        {wallet.title}
      </Text>

      <Text
        color="brightBlue300"
        fs={14}
        tAlign="right"
        sx={{ flex: "row", align: "center", gap: 4 }}
      >
        {isInjected ? (
          <>
            {t("walletConnect.provider.continue")}
            <ChevronRight />
          </>
        ) : (
          <>
            {t("walletConnect.provider.download")}
            <DownloadIcon />
          </>
        )}
      </Text>
    </SWalletButton>
  )
}
