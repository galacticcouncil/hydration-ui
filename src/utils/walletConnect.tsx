import { UniversalProvider } from "@walletconnect/universal-provider"
import WCProvider from "@walletconnect/universal-provider/dist/types/UniversalProvider"
import { Web3Modal } from "@web3modal/standalone"
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

export const WALLET_CONNECT_PROJECT_ID = "72e7d3d27d8ab1ebac47578375573726"
export const WALLET_CONNECT_RELAY_URL = "wss://relay.walletconnect.com"
export const HDX_CAIP_ID = "afdc188f45c71dacbaa0b62e16a91f72"

const web3modal = new Web3Modal({
  projectId: WALLET_CONNECT_PROJECT_ID,
  walletConnectVersion: 2,
})

export const WalletConnectContext = createContext<{
  connect: () => Promise<void>
}>({
  connect: async () => {},
})
export const useWalletConnect = () => useContext(WalletConnectContext)

export const WalletConnectProvider = ({ children }: PropsWithChildren) => {
  const [provider, setProvider] = useState<WCProvider>()

  const initProvider = useCallback(async () => {
    const _provider = await UniversalProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      relayUrl: WALLET_CONNECT_RELAY_URL,
    })
    setProvider(_provider)
  }, [])

  useEffect(() => {
    if (!provider) {
      initProvider()
    }
  }, [initProvider, provider])

  const connect = useCallback(async () => {
    if (!provider) return

    const params = {
      requiredNamespaces: {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: [`polkadot:${HDX_CAIP_ID}`],
          events: ['chainChanged", "accountsChanged'],
        },
      },
    }
    const { uri, approval } = await provider.client.connect(params)

    console.log("uri:", uri)
    if (uri) web3modal.openModal({ uri })

    try {
      const session = await approval()
      console.log("session:", session)

      const account = Object.values(session.namespaces)
        .map((namespace) => namespace.accounts)
        .flat()
      console.log("account:", account)
    } catch (e) {
      console.log(e)
    }
  }, [provider])

  return (
    <WalletConnectContext.Provider value={{ connect }}>
      {children}
    </WalletConnectContext.Provider>
  )
}
