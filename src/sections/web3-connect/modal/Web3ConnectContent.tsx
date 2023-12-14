import { ModalContents } from "components/Modal/contents/ModalContents"
import { useTranslation } from "react-i18next"
import { useWalletAccounts } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectAccountList } from "sections/web3-connect/accounts/Web3ConnectAccountList"
import { Web3ConnectErrorModal } from "sections/web3-connect/modal/Web3ConnectErrorModal"
import { Web3ConnectExternalModal } from "sections/web3-connect/modal/Web3ConnectExternalModal"
import { Web3ConnectProviderPending } from "sections/web3-connect/providers/Web3ConnectProviderPending"
import { Web3ConnectProviders } from "sections/web3-connect/providers/Web3ConnectProviders"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"

type Props = {
  page: number
  direction?: number
  onClose: () => void
  onBack: () => void
  onSelect: () => void
  onRetry: () => void
}

export const Web3ConnectContent: React.FC<Props> = ({
  onSelect,
  onRetry,
  ...props
}) => {
  const { t } = useTranslation()
  const {
    provider: activeProvider,
    mode,
    status,
    disconnect,
    error,
  } = useWeb3ConnectStore()

  const { data: accounts, isLoading } = useWalletAccounts(activeProvider)
  const isConnecting = isLoading || status === "pending"

  return (
    <ModalContents
      {...props}
      contents={[
        {
          title: t("walletConnect.provider.title"),
          content: <Web3ConnectProviders />,
          description: t(`walletConnect.provider.description.${mode || "all"}`),
        },
        {
          title: t("walletConnect.provider.title"),
          content: (
            <Web3ConnectExternalModal
              onClose={props.onClose}
              onSelect={onSelect}
            />
          ),
        },
        {
          title: t("walletConnect.accountSelect.title"),
          content:
            activeProvider && isConnecting ? (
              <Web3ConnectProviderPending provider={activeProvider} />
            ) : (
              <Web3ConnectAccountList accounts={accounts} />
            ),
        },
        {
          title: t("walletConnect.provider.title"),
          content: (
            <Web3ConnectErrorModal
              message={error}
              onRetry={() => {
                disconnect()
                onRetry?.()
              }}
            />
          ),
        },
      ]}
    />
  )
}
