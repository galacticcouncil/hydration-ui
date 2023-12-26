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
import {
  WalletMode,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { useShallow } from "hooks/useShallow"

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

const EVM_PROVIDERS: WalletProviderType[] = [WalletProviderType.MetaMask]

const ALTERNATIVE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.ExternalWallet,
]

const useWalletProviders = (mode: WalletMode) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return useMemo(() => {
    const wallets = getSupportedWallets()

    const isDefaultMode = mode === "default"
    const isEvmMode = mode === "evm"
    const isSubstrateMode = mode === "substrate"

    const defaultProviders = wallets.filter((provider) => {
      if (isEvmMode) return EVM_PROVIDERS.includes(provider.type)
      const byScreen = isDesktop
        ? DESKTOP_PROVIDERS.includes(provider.type)
        : MOBILE_PROVIDERS.includes(provider.type)

      const isEvmProvider = EVM_PROVIDERS.includes(provider.type)

      const byMode =
        isDefaultMode ||
        (isEvmMode && isEvmProvider) ||
        (isSubstrateMode && !isEvmProvider)

      return byScreen && byMode
    })

    const alternativeProviders = wallets.filter((provider) => {
      if (isEvmMode || isSubstrateMode) return false
      return ALTERNATIVE_PROVIDERS.includes(provider.type)
    })

    return {
      defaultProviders,
      alternativeProviders,
    }
  }, [isDesktop, mode])
}

export const Web3ConnectProviders = () => {
  const { t } = useTranslation()

  const mode = useWeb3ConnectStore(useShallow((state) => state.mode))

  const { defaultProviders, alternativeProviders } = useWalletProviders(mode)

  return (
    <>
      <div sx={{ flex: "column", gap: 8 }}>
        {defaultProviders.map((provider) => (
          <Web3ConnectProviderButton {...provider} key={provider.type} />
        ))}
      </div>
      {alternativeProviders.length > 0 && (
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
