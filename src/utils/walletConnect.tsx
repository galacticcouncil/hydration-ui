import Client from "@walletconnect/sign-client"
import { SessionTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import { Web3Modal } from "@web3modal/standalone"
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

export const WALLET_CONNECT_PROJECT_ID = "c47a5369367ec2dad6b49c478eb772f9"
export const WALLET_CONNECT_RELAY_URL = "wss://relay.walletconnect.com"
export const HDX_CAIP_ID = "afdc188f45c71dacbaa0b62e16a91f72"

const web3modal = new Web3Modal({
  projectId: WALLET_CONNECT_PROJECT_ID,
  walletConnectVersion: 2,
})

export type WalletConnectCtx = {
  client?: Client
  session?: SessionTypes.Struct
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  accounts: string[]
  addresses: string[]
  isInitializing: boolean
  isConnecting: boolean
  isDisconnecting: boolean
}
export const WalletConnectContext = createContext<WalletConnectCtx>({
  client: undefined,
  session: undefined,
  connect: async () => {},
  disconnect: async () => {},
  accounts: [],
  addresses: [],
  isInitializing: false,
  isConnecting: false,
  isDisconnecting: false,
})
export const useWalletConnect = () => useContext(WalletConnectContext)

export const WalletConnectProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = useState<Client>()
  const [session, setSession] = useState<SessionTypes.Struct>()
  const [accounts, setAccounts] = useState<string[]>([])
  const [addresses, setAddresses] = useState<string[]>([])

  const [isInitializing, setIsInitializing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const initClient = useCallback(async () => {
    try {
      setIsInitializing(true)
      const _client = await Client.init({
        projectId: WALLET_CONNECT_PROJECT_ID,
        relayUrl: WALLET_CONNECT_RELAY_URL,
      })
      setClient(_client)
    } catch (e) {
      console.error("Could not initialize WalletConnect client", e)
    } finally {
      setIsInitializing(false)
    }
  }, [])

  useEffect(() => {
    if (!client) initClient()
  }, [initClient, client])

  const connect = useCallback(async () => {
    if (!client) return

    const params = {
      requiredNamespaces: {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: [`polkadot:${HDX_CAIP_ID}`],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    }

    try {
      setIsConnecting(true)

      const { uri, approval } = await client.connect(params)

      if (uri) web3modal.openModal({ uri })

      const session = await approval()
      setSession(session)

      const accounts = Object.values(session.namespaces)
        .map((namespace) => namespace.accounts)
        .flat()
      setAccounts(accounts)

      const addresses = accounts.map((account) => account.split(":")[2])
      setAddresses(addresses)

      web3modal.closeModal()
    } catch (e) {
      console.error("Could not connect to WalletConnect", e)
    } finally {
      setIsConnecting(false)
    }
  }, [client])

  const disconnect = useCallback(async () => {
    if (!client || !session) return

    try {
      setIsDisconnecting(true)
      await client.disconnect({
        topic: session.topic,
        reason: getSdkError("USER_DISCONNECTED"),
      })
    } catch (e) {
      console.error("Could not disconnect from WalletConnect", e)
    } finally {
      setIsDisconnecting(false)
    }
  }, [client, session])

  return (
    <WalletConnectContext.Provider
      value={{
        client,
        session,
        connect,
        disconnect,
        accounts,
        addresses,
        isInitializing,
        isConnecting,
        isDisconnecting,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  )
}
