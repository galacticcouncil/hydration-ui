import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import { WalletConnectModal } from "@walletconnect/modal"
import { SessionTypes } from "@walletconnect/types"
import {
  IUniversalProvider,
  UniversalProvider,
} from "@walletconnect/universal-provider"
import WalletConnectLogo from "assets/icons/WalletConnect.svg"
import {
  PolkadotNamespaceChainId,
  WalletConnectSigner,
} from "sections/web3-connect/wallets/WalletConnect/WalletConnectSigner"
import { POLKADOT_APP_NAME } from "utils/api"

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID as string
const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL as string
const HYDRADX_CHAIN_ID = import.meta.env
  .VITE_HDX_CAIP_ID as string as PolkadotNamespaceChainId

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

const requiredNamespaces = {
  polkadot: {
    methods: ["polkadot_signTransaction", "polkadot_signMessage"],
    chains: [HYDRADX_CHAIN_ID],
    events: ["accountsChanged", "disconnect"],
  },
}

const chains = Object.values(requiredNamespaces)
  .map((namespace) => namespace.chains)
  .flat()

const modal = new WalletConnectModal({
  projectId: WC_PROJECT_ID,
  chains,
})

const provider = await UniversalProvider.init(walletConnectParams)

export class WalletConnect implements Wallet {
  extensionName = "walletconnect"
  title = "WalletConnect"
  installUrl = ""
  logo = {
    src: WalletConnectLogo,
    alt: "WalletConnect Logo",
  }

  _extension: IUniversalProvider | undefined
  _signer: WalletConnectSigner | undefined
  _session: SessionTypes.Struct | undefined

  constructor({
    onModalOpen,
    onModalClose,
  }: {
    onModalOpen?: () => void
    onModalClose?: () => void
  } = {}) {
    modal.subscribeModal((state) => {
      state.open ? onModalOpen?.() : onModalClose?.()
    })
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    return true
  }

  get rawExtension() {
    return provider
  }

  transformError = (err: Error): Error => {
    return err
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    try {
      const { uri, approval } = await this.rawExtension.client.connect({
        requiredNamespaces,
      })

      if (uri) {
        await modal.openModal({ uri, chains })
      }

      const session = await approval()

      const client = this.rawExtension.client

      this._extension = this.rawExtension
      this._session = session
      this._signer = new WalletConnectSigner(client, session, HYDRADX_CHAIN_ID)
    } finally {
      modal.closeModal()
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

    return wcAccounts.map((wcAccount) => {
      const address = wcAccount.split(":")[2]
      return {
        address,
        source: this.extensionName,
        name: this.title,
        wallet: this,
        signer: this.signer,
      }
    })
  }

  subscribeAccounts = async () => {}
}
