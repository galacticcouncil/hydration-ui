import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  BaseWallet,
  WalletAggregator,
  WalletConnectProvider,
} from "utils/signer"

const walletConnectParams = {
  projectId: import.meta.env.VITE_WC_PROJECT_ID,
  relayUrl: "wss://relay.walletconnect.com",
  metadata: {
    name: "HydraDX",
    description: "HydraDX",
    url: import.meta.env.VITE_DOMAIN_URL,
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
}

const walletAggregator = new WalletAggregator(
  new WalletConnectProvider(walletConnectParams, "HydraDX"),
)

type OnboardProviderProps = { children: JSX.Element }

interface PolkadotWalletsContextProviderProps {
  children: JSX.Element
  walletAggregator: WalletAggregator
  initialWaitMs?: number
}

interface PolkadotWalletsContextProps {
  wallet: BaseWallet | undefined
}

const PolkadotWalletsContext = createContext<PolkadotWalletsContextProps>({
  wallet: undefined,
})

export const useWalletConnect = () => useContext(PolkadotWalletsContext)

const PolkadotWalletsContextProvider = ({
  children,
  walletAggregator,
  initialWaitMs = 5 /* the default is set to 5ms to give extensions enough lead time to inject their providers */,
}: PolkadotWalletsContextProviderProps) => {
  const [wallet, setWallet] = useState<BaseWallet | undefined>()

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const wallet = walletAggregator.getWallet()
      const isWalletConnected = walletAggregator.getWallet().isConnected()

      if (!isWalletConnected) wallet.autoConnect()

      setWallet(wallet)
    }, initialWaitMs)
    return () => clearTimeout(timeoutId)
  }, [walletAggregator, initialWaitMs])

  const contextData = useMemo(
    () => ({
      wallet,
    }),
    [wallet],
  )

  return (
    <PolkadotWalletsContext.Provider value={contextData}>
      {children}
    </PolkadotWalletsContext.Provider>
  )
}

export const OnboardProvider = ({ children }: OnboardProviderProps) => {
  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      {children}
    </PolkadotWalletsContextProvider>
  )
}
