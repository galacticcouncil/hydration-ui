import { SWalletButton } from "sections/wallet/connect/providers/WalletConnectProviders.styled"
import { Text } from "components/Typography/Text/Text"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import { useTranslation } from "react-i18next"
import { Wallet } from "@talismn/connect-wallets"
import { getWalletMeta } from "sections/wallet/connect/modal/WalletConnectModal.utils"

type Props = {
  wallet: Wallet
  onClick: () => void
  isInjected: boolean
  isNovaWallet: boolean
}

export const WalletConnectProvidersButton = ({
  wallet,
  onClick,
  isInjected,
  isNovaWallet,
}: Props) => {
  const { t } = useTranslation()
  const walletMeta = getWalletMeta(wallet, isNovaWallet)

  if (!walletMeta) return null

  return (
    <SWalletButton onClick={onClick}>
      <img
        src={walletMeta.logo.src}
        alt={walletMeta.logo.alt}
        width={40}
        height={40}
      />
      <Text fs={18} css={{ flexGrow: 1 }}>
        {walletMeta.title}
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
