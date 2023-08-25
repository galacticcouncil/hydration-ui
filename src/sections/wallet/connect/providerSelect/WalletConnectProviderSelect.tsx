import { Wallet } from "@talismn/connect-wallets"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { WalletConnectProviders } from "sections/wallet/connect/providers/WalletConnectProviders"
import { ExternalWalletConnectProviderButton } from "sections/wallet/connect/providers/button/ExternalWalletConnectProviderButton"

type Props = {
  onWalletSelect: (wallet: Wallet) => void
  onExternalWallet: () => void
  onWalletConnect: () => void
}

export const WalletConnectProviderSelect = ({
  onWalletSelect,
  onExternalWallet,
  onWalletConnect,
}: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <Text fw={400} color="basic200" sx={{ mt: 6, mb: 36 }}>
        {t("walletConnect.provider.description")}
      </Text>
      <WalletConnectProviders
        onConnect={onWalletSelect}
        onDownload={(wallet) => window.open(wallet.installUrl, "_blank")}
        onWalletConnect={onWalletConnect}
      />
      {import.meta.env.VITE_FF_EXTERNAL_WALLET_ENABLED === "true" && (
        <>
          <Text sx={{ py: 8 }} fs={14} color="basic400" tAlign="center">
            {t("or")}
          </Text>
          <ExternalWalletConnectProviderButton onClick={onExternalWallet} />
        </>
      )}
    </>
  )
}
