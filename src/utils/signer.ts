import type { HexString } from "@polkadot/util/types"
import type { Signer, SignerResult } from "@polkadot/types/types"
import type { SignerPayloadJSON, SignerPayloadRaw } from "@polkadot/types/types"
import type { SessionTypes, SignClientTypes } from "@walletconnect/types"

import { TypeRegistry } from "@polkadot/types"
import SignClient from "@walletconnect/sign-client"

import QRCodeModal from "@walletconnect/qrcode-modal"

export type KeypairType = "ed25519" | "sr25519"

export interface Account {
  address: string
  type?: KeypairType
  genesisHash?: string | null
  name?: string
}

export enum WalletType {
  WALLET_CONNECT = "WALLET_CONNECT",
}

export interface BaseWalletProvider {
  getWallet: () => BaseWallet
}

export interface WalletMetadata {
  id: string
  title: string
  description?: string
  urls?: { main?: string; browsers?: Record<string, string> }
  iconUrl?: string
  version?: string
}

export interface BaseWallet {
  metadata: WalletMetadata
  type: WalletType
  // signer will be available when the wallet is connected, otherwise it is undefined
  signer: Signer | undefined
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isConnected: () => boolean
  getAccounts: () => Promise<Account[]>
  autoConnect: () => Promise<void>
}

export type WcAccount = `${string}:${string}:${string}`
export type PolkadotNamespaceChainId = `polkadot:${string}`
export interface WalletConnectConfiguration extends SignClientTypes.Options {}

interface Signature {
  signature: HexString
}

export class WalletConnectSigner implements Signer {
  registry: TypeRegistry
  client: SignClient
  session: SessionTypes.Struct
  chainId: PolkadotNamespaceChainId
  id = 0

  constructor(
    client: SignClient,
    session: SessionTypes.Struct,
    chainId: PolkadotNamespaceChainId,
  ) {
    this.client = client
    this.session = session
    this.registry = new TypeRegistry()
    this.chainId = chainId
  }

  // this method is set this way to be bound to this class.
  signPayload = async (payload: SignerPayloadJSON): Promise<SignerResult> => {
    let request = {
      topic: this.session.topic,
      chainId: this.chainId,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "polkadot_signTransaction",
        params: { address: payload.address, transactionPayload: payload },
      },
    }
    let { signature } = await this.client.request<Signature>(request)
    return { id: ++this.id, signature }
  }

  // this method is set this way to be bound to this class.
  // It might be used outside of the object context to sign messages.
  // ref: https://polkadot.js.org/docs/extension/cookbook#sign-a-message
  signRaw = async (raw: SignerPayloadRaw): Promise<SignerResult> => {
    let request = {
      topic: this.session.topic,
      chainId: this.chainId,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "polkadot_signMessage",
        params: { address: raw.address, message: raw.data },
      },
    }
    let { signature } = await this.client.request<Signature>(request)
    return { id: ++this.id, signature }
  }
}

export const POLKADOT_CHAIN_ID = import.meta.env.VITE_HDX_CAIP_ID
export const WC_VERSION = "2.0"

const toWalletAccount = (wcAccount: WcAccount) => {
  let address = wcAccount.split(":")[2]
  return { address }
}

class WalletConnectWallet implements BaseWallet {
  type = WalletType.WALLET_CONNECT
  appName: string
  metadata: WalletMetadata
  config: WalletConnectConfiguration
  client: SignClient | undefined
  signer: Signer | undefined
  session: SessionTypes.Struct | undefined
  chainId: PolkadotNamespaceChainId

  constructor(
    config: WalletConnectConfiguration,
    appName: string,
    chainId?: PolkadotNamespaceChainId,
  ) {
    this.config = config
    this.appName = appName
    this.metadata = {
      id: "wallet-connect",
      title: config.metadata?.name || "Wallet Connect",
      description: config.metadata?.description || "",
      urls: { main: config.metadata?.url || "" },
      iconUrl: config.metadata?.icons[0] || "",
      version: WC_VERSION,
    }
    this.chainId = chainId || POLKADOT_CHAIN_ID
  }

  reset(): void {
    this.client = undefined
    this.session = undefined
    this.signer = undefined
  }

  async getAccounts(): Promise<Account[]> {
    let accounts: Account[] = []
    if (this.session) {
      let wcAccounts = Object.values(this.session.namespaces)
        .map((namespace) => namespace.accounts)
        .flat()
      accounts = wcAccounts.map((wcAccount) =>
        toWalletAccount(wcAccount as WcAccount),
      )
    }
    return accounts
  }

  async connect() {
    // reset the client
    this.reset()

    // init the client
    let client = await SignClient.init(this.config)
    let params = {
      requiredNamespaces: {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: [this.chainId],
          events: [],
        },
      },
    }

    const { uri, approval } = await client.connect(params)
    return new Promise<void>((resolve, reject) => {
      // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
      if (uri) {
        QRCodeModal.open(uri, () => {
          reject(new Error("Canceled pairing. QR Code Modal closed."))
        })
      }
      // Await session approval from the wallet.
      approval()
        .then((session) => {
          // setup the client
          this.client = client
          this.session = session
          this.signer = new WalletConnectSigner(client, session, this.chainId)
          resolve()
        })
        .catch(reject)
        .finally(() => QRCodeModal.close())
    })
  }

  async autoConnect() {
    const client = await SignClient.init(this.config)
    const session = client.session.values[0]
    if (session) {
      const expireDate = new Date(session.expiry * 1000)
      const now = new Date()

      if (now < expireDate && session.acknowledged) {
        this.client = client
        this.session = session
        this.signer = new WalletConnectSigner(client, session, this.chainId)
      } else {
        this.client?.disconnect({
          topic: session.topic,
          reason: {
            code: -1,
            message: "Session is expired",
          },
        })
      }
    }
  }

  async disconnect() {
    if (this.session?.topic) {
      this.client?.disconnect({
        topic: this.session?.topic,
        reason: {
          code: -1,
          message: "Disconnected by client!",
        },
      })
    }
    this.reset()
  }

  isConnected() {
    return !!(this.client && this.signer && this.session)
  }
}

export class WalletConnectProvider implements BaseWalletProvider {
  config: WalletConnectConfiguration
  appName: string

  constructor(config: WalletConnectConfiguration, appName: string) {
    this.config = config
    this.appName = appName
  }

  getWallet(): BaseWallet {
    return new WalletConnectWallet(this.config, this.appName)
  }
}

export class WalletAggregator {
  walletProvider: BaseWalletProvider

  constructor(providers: BaseWalletProvider) {
    this.walletProvider = providers
  }

  getWallet(): BaseWallet {
    let wallet: BaseWallet = this.walletProvider.getWallet()

    return wallet
  }
}
