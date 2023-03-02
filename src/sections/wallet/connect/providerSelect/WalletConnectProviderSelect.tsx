import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

import { WalletConnectProviders } from "sections/wallet/connect/providers/WalletConnectProviders"
import { Wallet } from "@talismn/connect-wallets"
import { ExternalWalletConnectProviderButton } from "../providers/button/ExternalWalletConnectProviderButton"
import { useState } from "react"
import { ExternalWalletConnectModal } from "../modal/ExternalWalletConnectModal"

type Props = {
  onWalletSelect: (wallet: Wallet) => void
  onClose: () => void
}

export const WalletConnectProviderSelect = ({
  onWalletSelect,
  onClose,
}: Props) => {
  const { t } = useTranslation("translation")
  const [isAddExternalWallet, setAddExternalWallet] = useState(false)

  return (
    <>
      {!isAddExternalWallet ? (
        <>
          <Text fw={400} color="basic200" sx={{ mt: 6, mb: 36 }}>
            {t("walletConnect.provider.description")}
          </Text>
          <WalletConnectProviders
            onConnect={onWalletSelect}
            onDownload={(wallet) => window.open(wallet.installUrl, "_blank")}
          />
          {import.meta.env.VITE_FF_EXTERNAL_WALLET_ENABLED === "true" && (
            <>
              <Text sx={{ py: 4 }} fs={14} color="basic400" tAlign="center">
                {t("or")}
              </Text>
              <ExternalWalletConnectProviderButton
                onClick={() => setAddExternalWallet(true)}
              />
            </>
          )}
        </>
      ) : (
        <ExternalWalletConnectModal
          onBack={() => setAddExternalWallet(false)}
          onClose={onClose}
        />
      )}
    </>
  )
}
