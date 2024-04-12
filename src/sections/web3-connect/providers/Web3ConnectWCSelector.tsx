import { Button } from "components/Button/Button"
import { useEffect } from "react"
import {
  WalletProviderType,
  getWalletProviderByType,
  useEnableWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectWalletLoader } from "sections/web3-connect/modal/Web3ConnectWalletLoader"
import {
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletConnect } from "sections/web3-connect/wallets/WalletConnect"
import { isEvmAccount } from "utils/evm"

export type Web3ConnectWCSelectorProps = {}

const walletConnectType = WalletProviderType.WalletConnect

const getWalletConnect = () => {
  return getWalletProviderByType(walletConnectType).wallet as WalletConnect
}

export const Web3ConnectWCSelector: React.FC<
  Web3ConnectWCSelectorProps
> = () => {
  const { setStatus, setError, provider, status, account, mode } =
    useWeb3ConnectStore()

  const isDefaultMode = mode === "default"
  const isEvmMode = mode === "evm"
  const isSubstrateMode = mode === "substrate"

  const { enable, isLoading } = useEnableWallet(walletConnectType, {
    onSuccess: () =>
      setStatus(walletConnectType, WalletProviderStatus.Connected),
    onError: (error) => {
      setStatus(walletConnectType, WalletProviderStatus.Error)
      if (error instanceof Error && error.message) {
        setError(error.message)
      }
    },
  })

  const wallet = getWalletConnect()

  const isConnectedToWc =
    !!account?.address &&
    provider === walletConnectType &&
    status === WalletProviderStatus.Connected

  const isSessionActive = !!wallet?._session

  const shouldTriggerAutoConnect =
    (isConnectedToWc && !isSessionActive) || isEvmMode || isSubstrateMode

  useEffect(() => {
    if (shouldTriggerAutoConnect) {
      const isEvm =
        (isDefaultMode && isEvmAccount(account?.address)) || isEvmMode
      enable(isEvm ? "eip155" : "polkadot")
    }
  }, [
    account?.address,
    enable,
    isDefaultMode,
    isEvmMode,
    shouldTriggerAutoConnect,
  ])

  return (
    <div sx={{ width: "100%" }}>
      {shouldTriggerAutoConnect || isLoading ? (
        <Web3ConnectWalletLoader provider={walletConnectType} />
      ) : (
        <div sx={{ flex: "column", gap: 20, width: "100%" }}>
          <Button
            fullWidth
            onClick={() => {
              enable("eip155")
            }}
          >
            EVM
          </Button>
          <Button
            fullWidth
            onClick={() => {
              enable("polkadot")
            }}
          >
            SUBSTRATE
          </Button>
        </div>
      )}
    </div>
  )
}
