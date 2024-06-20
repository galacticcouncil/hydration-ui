import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import { WalletConnectModal } from "@walletconnect/modal"
import { SessionTypes } from "@walletconnect/types"
import {
  IUniversalProvider,
  NamespaceConfig,
  UniversalProvider,
} from "@walletconnect/universal-provider"
import WalletConnectLogo from "assets/icons/WalletConnect.svg"
import { POLKADOT_APP_NAME } from "utils/api"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { isEvmAddress } from "utils/evm"
import { shortenAccountAddress } from "utils/formatting"
import {
  PolkadotNamespaceChainId,
  PolkadotSigner,
} from "sections/web3-connect/signer/PolkadotSigner"
import { noop } from "utils/helpers"
import { EvmParachain } from "@galacticcouncil/xcm-core"

// @TODO: Remove when the old domain is deprecated
const isOldDomain = window?.location?.hostname.includes("hydradx.io")

const WC_PROJECT_ID = isOldDomain
  ? "c47a5369367ec2dad6b49c478eb772f9"
  : (import.meta.env.VITE_WC_PROJECT_ID as string)
const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL as string

export const POLKADOT_CAIP_ID_MAP: Record<string, PolkadotNamespaceChainId> = {
  hydradx: import.meta.env
    .VITE_HDX_CAIP_ID as string as PolkadotNamespaceChainId,
  polkadot: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
  acala: "polkadot:fc41b9bd8ef8fe53d58c7ea67c794c7e",
  assethub: "polkadot:68d56f15f85d3136970ec16946040bc1",
  astar: "polkadot:9eb76c5184c4ab8679d2d5d819fdf90b",
  bifrost: "polkadot:262e1b2ad728475fd6fe88e62d34c200",
  centrifuge: "polkadot:b3db41421702df9a7fcac62b53ffeac8",
  crust: "polkadot:4319cc49ee79495b57a1fec4d2bd43f5",
  interlay: "polkadot:bf88efe70e9e0e916416e8bed61f2b45",
  nodle: "polkadot:97da7ede98d7bad4e36b4d734b605542",
  phala: "polkadot:1bb969d85965e4bb5a651abbedf21a54",
  subsocial: "polkadot:4a12be580bb959937a1c7a61d5cf2442",
  unique: "polkadot:84322d9cddbf35088f1e54e9a85c967a",
  zeitgeist: "polkadot:1bf2a2ecb4a868de66ea8610f2ce7c8c",
}

const POLKADOT_CHAIN_IDS = Object.values(POLKADOT_CAIP_ID_MAP)

const walletConnectParams = {
  projectId: WC_PROJECT_ID,
  relayUrl: "wss://relay.walletconnect.com",
  metadata: {
    name: POLKADOT_APP_NAME,
    description: POLKADOT_APP_NAME,
    url: DOMAIN_URL,
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
}

const evmChainsArr = Array.from(chainsMap.values())
  .filter((chain) => chain.isEvmParachain())
  .map((chain) => (chain as EvmParachain).client.chain)

const namespaces = {
  eip155: {
    chains: evmChainsArr.map(({ id }) => `eip155:${id}`),
    methods: [
      "eth_sendTransaction",
      "eth_signTransaction",
      "eth_sign",
      "personal_sign",
      "eth_signTypedData_v4",
      "eth_signTypedData",
      "wallet_switchEthereumChain",
      "wallet_addEthereumChain",
    ],
    events: ["chainChanged", "accountsChanged"],
    rpcMap: evmChainsArr.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.rpcUrls.default.http[0],
      }),
      {},
    ),
  },
  polkadot: {
    methods: ["polkadot_signTransaction", "polkadot_signMessage"],
    chains: POLKADOT_CHAIN_IDS,
    events: ["accountsChanged", "disconnect"],
  },
}

export type NamespaceType = keyof typeof namespaces

type ModalSubFn = (session?: SessionTypes.Struct) => void

export class WalletConnect implements Wallet {
  extensionName = "walletconnect"
  title = "WalletConnect"
  installUrl = ""
  logo = {
    src: WalletConnectLogo,
    alt: "WalletConnect Logo",
  }

  _modal: WalletConnectModal | undefined
  _extension: IUniversalProvider | undefined
  _signer: PolkadotSigner | EthereumSigner | undefined
  _session: SessionTypes.Struct | undefined
  _namespace: NamespaceConfig | undefined
  _instance: IUniversalProvider | undefined

  onSessionDelete: () => void = noop

  constructor({
    onModalOpen,
    onModalClose,
    onSesssionDelete,
  }: {
    onModalOpen?: ModalSubFn
    onModalClose?: ModalSubFn
    onSesssionDelete?: () => void
  } = {}) {
    this._modal = new WalletConnectModal({
      projectId: WC_PROJECT_ID,
    })

    this.subscribeToModalEvents(onModalOpen, onModalClose)

    if (onSesssionDelete) this.onSessionDelete = onSesssionDelete
  }

  getInstance = async () => {
    if (!this._instance) {
      this._instance = await UniversalProvider.init(walletConnectParams)
    }

    return this._instance
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get modal() {
    return this._modal
  }

  get namespace() {
    return this._namespace
  }

  get installed() {
    return true
  }

  get rawExtension() {
    return this._extension
  }

  initializeProvider = async () => {
    await this._extension?.cleanupPendingPairings()
    await this._extension?.disconnect()

    const provider = await this.getInstance()

    if (!provider) {
      throw new Error(
        "WalletConnectError: Connection failed. Please try again.",
      )
    }

    this._extension = provider
    //@ts-ignore WC types are not up to date
    provider.on("display_uri", this.handleDisplayUri)
    //@ts-ignore WC types are not up to date
    provider.on("session_update", this.handleSessionUpdate)
    //@ts-ignore WC types are not up to date
    provider.on("session_delete", this.handleSessionDelete)

    return provider
  }

  transformError = (err: Error): Error => {
    return err
  }

  setNamespace = async (namespace: keyof typeof namespaces) => {
    this._namespace = {
      [namespace]: namespaces[namespace],
    }
  }

  getChains = () => {
    if (!this.namespace) return []

    return Object.values(this.namespace)
      .map((namespace) => namespace.chains)
      .flat()
  }

  subscribeToModalEvents = (onOpen?: ModalSubFn, onClose?: ModalSubFn) => {
    this.modal?.subscribeModal((state) => {
      if (state.open) {
        onOpen?.()
      } else {
        onClose?.(this._session)

        if (!this._session) {
          this.disconnect()
        }
      }
    })
  }

  handleDisplayUri = async (uri: string) => {
    await this.modal?.openModal({ uri, chains: this.getChains() })
  }

  handleSessionUpdate = ({ session }: { session: SessionTypes.Struct }) => {
    this._session = session
  }

  handleSessionDelete = () => {
    this.disconnect()
    this.onSessionDelete()
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    const provider = await this.initializeProvider()

    if (!provider) {
      throw new Error(
        "WalletConnectError: WalletConnect provider is not initialized.",
      )
    }

    if (!this.namespace) {
      throw new Error(
        "WalletConnectError: Namespace is required to enable WalletConnect.",
      )
    }

    try {
      const session = await provider.connect({
        optionalNamespaces: this.namespace,
      })

      if (!session) {
        throw new Error(
          "WalletConnectError: Failed to create WalletConnect sessopm.",
        )
      }

      this._session = session

      const accounts = await this.getAccounts()

      const namespace = Object.keys(this.namespace).pop() as NamespaceType

      if (namespace === "eip155" && provider instanceof UniversalProvider) {
        const mainAddress = accounts[0]?.address
        this._signer = mainAddress
          ? new EthereumSigner(mainAddress, provider)
          : undefined
      }

      if (namespace === "polkadot" && provider.client) {
        this._signer = new PolkadotSigner(provider.client, session)
      }
    } finally {
      this.modal?.closeModal()
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this._session) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    const wcAccounts = Object.values(this._session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat()

    // return only first (active) account
    return wcAccounts.slice(0, 1).map((wcAccount) => {
      const address = wcAccount.split(":")[2]
      return {
        address,
        source: this.extensionName,
        name: isEvmAddress(address)
          ? shortenAccountAddress(address)
          : this.title,
        wallet: this,
        signer: this.signer,
      }
    })
  }

  subscribeAccounts = async () => {}

  disconnect = () => {
    const provider = this._extension
    provider?.off("display_uri", this.handleDisplayUri)
    provider?.off("session_update", this.handleSessionUpdate)
    provider?.off("session_delete", this.handleSessionDelete)

    provider?.cleanupPendingPairings()
    provider?.disconnect()

    this._signer = undefined
    this._session = undefined
    this._extension = undefined

    if ("indexedDB" in window) {
      // reset previous saved settings of WC2 to avoid mismatch between EVM and Substrate
      indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB")
    }
  }
}
