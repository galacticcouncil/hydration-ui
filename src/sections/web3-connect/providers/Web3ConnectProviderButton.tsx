import ChevronRight from "assets/icons/ChevronRight.svg?react"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import {
  WalletProvider,
  WalletProviderType,
  useEnableWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { SProviderButton } from "./Web3ConnectProviders.styled"
import {
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"

type Props = WalletProvider & {
  children?: (props: { onClick: () => void }) => JSX.Element
}

export const Web3ConnectProviderButton: FC<Props> = ({
  type,
  wallet,
  children,
}) => {
  const { t } = useTranslation()

  const { setStatus, setError } = useWeb3ConnectStore()

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

  function onClick() {
    if (type === WalletProviderType.WalletConnect) {
      // defer WalletConnect enabling until the user clicks chooses a chain to connect to
      setStatus(type, WalletProviderStatus.Pending)
    } else {
      installed ? enable() : openInstallUrl(installUrl)
    }
  }

  if (typeof children === "function") {
    return children({ onClick })
  }

  return (
    <SProviderButton onClick={onClick}>
      <img src={logo.src} alt={logo.alt} width={40} height={40} />
      <Text fs={14} sx={{ flexGrow: 1, mt: 8 }}>
        {title}
      </Text>
      <Text color="brightBlue300" fs={13} sx={{ flex: "row", align: "center" }}>
        {installed ? (
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
    </SProviderButton>
  )
}

function openInstallUrl(installUrl: string) {
  window.open(installUrl, "_blank")
}
