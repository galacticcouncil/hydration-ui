import ChevronRight from "assets/icons/ChevronRight.svg?react"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import LogoutIcon from "assets/icons/LogoutIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC, PropsWithChildren, useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  WalletProvider,
  WalletProviderType,
  useEnableWallet,
  useWalletAccounts,
} from "sections/web3-connect/Web3Connect.utils"
import {
  SAccountIndicator,
  SAltProviderButton,
  SConnectionIndicator,
  SProviderButton,
} from "./Web3ConnectProviders.styled"
import {
  WalletMode,
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"

type Props = WalletProvider & {
  children?: (props: {
    onClick: () => void
    isConnected: boolean
  }) => JSX.Element
  mode?: WalletMode
}

export const Web3ConnectProviderButton: FC<Props> = ({
  type,
  wallet,
  mode,
  children,
}) => {
  const { t } = useTranslation()

  const { setStatus, setError, disconnect, getStatus } = useWeb3ConnectStore()

  const { logo, title, installed, installUrl } = wallet

  const { enable } = useEnableWallet(type, {
    onMutate: () => setStatus(type, WalletProviderStatus.Pending),
    onSuccess: () => setStatus(type, WalletProviderStatus.Connected),
    onError: (error) => {
      setStatus(type, WalletProviderStatus.Error)
      if (error instanceof Error && error.message) {
        setError(error.message)
      }
    },
  })

  const { data: accounts } = useWalletAccounts(type)
  const accountsCount = accounts?.length || 0

  const isConnected = getStatus(type) === WalletProviderStatus.Connected

  const onClick = useCallback(() => {
    if (type === WalletProviderType.ExternalWallet) {
      return enable()
    }

    if (isConnected) {
      return disconnect(type)
    }
    if (type === WalletProviderType.WalletConnect) {
      enable(mode === WalletMode.EVM ? "eip155" : "polkadot")
    } else {
      installed ? enable() : openInstallUrl(installUrl)
    }
  }, [disconnect, enable, installUrl, installed, isConnected, mode, type])

  if (typeof children === "function") {
    return children({ onClick, isConnected })
  }

  return (
    <SProviderButton onClick={onClick}>
      <img
        loading="lazy"
        src={logo.src}
        alt={logo.alt}
        width={32}
        height={32}
      />
      <Text fs={[12, 14]} sx={{ mt: 8 }} tAlign="center">
        {title}
      </Text>
      <Text
        color={isConnected ? "basic500" : "brightBlue300"}
        fs={[12, 13]}
        sx={{ flex: "row", align: "center" }}
      >
        {isConnected ? (
          <>
            {t("walletConnect.provider.disconnect")}
            <LogoutIcon width={18} height={18} />
          </>
        ) : installed ? (
          <>
            {t("walletConnect.provider.continue")}
            <ChevronRight width={18} height={18} />
          </>
        ) : (
          <>
            {t("walletConnect.provider.download")}
            <DownloadIcon width={18} height={18} />
          </>
        )}
      </Text>
      {isConnected && <SConnectionIndicator />}
      {isConnected && accountsCount > 0 && (
        <SAccountIndicator>+{accountsCount}</SAccountIndicator>
      )}
    </SProviderButton>
  )
}

export const Web3ConnectAltProviderButton: FC<
  PropsWithChildren & WalletProvider
> = ({ children, ...provider }) => {
  return (
    <Web3ConnectProviderButton {...provider} key={provider.type}>
      {(props) => (
        <SAltProviderButton {...props}>
          <img
            loading="lazy"
            src={provider.wallet.logo.src}
            alt={provider.wallet.logo.alt}
            width={24}
            height={24}
            sx={{ mr: 4 }}
          />
          {children}
          <ChevronRight width={18} height={18} />
        </SAltProviderButton>
      )}
    </Web3ConnectProviderButton>
  )
}

function openInstallUrl(installUrl: string) {
  window.open(installUrl, "_blank")
}
