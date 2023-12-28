import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  WalletProviderType,
  getSupportedWallets,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectProviderButton } from "sections/web3-connect/providers/Web3ConnectProviderButton"
import { useMemo } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"

const MOBILE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.Talisman,
  WalletProviderType.SubwalletJS,
  WalletProviderType.Enkrypt,
  WalletProviderType.NovaWallet,
  WalletProviderType.WalletConnect,
]

const DESKTOP_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.Talisman,
  WalletProviderType.SubwalletJS,
  WalletProviderType.Enkrypt,
  WalletProviderType.PolkadotJS,
  WalletProviderType.WalletConnect,
]

const ALTERNATIVE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.ExternalWallet,
]

const useWalletProviders = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return useMemo(() => {
    const wallets = getSupportedWallets()
    const defaultProviders = wallets.filter((provider) => {
      return isDesktop
        ? DESKTOP_PROVIDERS.includes(provider.type)
        : MOBILE_PROVIDERS.includes(provider.type)
    })

    const alternativeProviders = wallets.filter((provider) =>
      ALTERNATIVE_PROVIDERS.includes(provider.type),
    )

    return {
      defaultProviders,
      alternativeProviders,
    }
  }, [isDesktop])
}

export const Web3ConnectProviders: React.FC = () => {
  const { t } = useTranslation()

  const { defaultProviders, alternativeProviders } = useWalletProviders()

  return (
    <>
      <Text fw={400} color="basic400" sx={{ mb: 20 }}>
        {t("walletConnect.provider.description")}
      </Text>
      <div sx={{ flex: "column", gap: 8 }}>
        {defaultProviders.map((provider) => (
          <Web3ConnectProviderButton {...provider} key={provider.type} />
        ))}
      </div>
      {alternativeProviders && (
        <>
          <Text sx={{ py: 8 }} fs={14} color="basic400" tAlign="center">
            {t("or")}
          </Text>
          {alternativeProviders.map((provider) => (
            <Web3ConnectProviderButton {...provider} key={provider.type} />
          ))}
        </>
      )}
    </>
  )
}
