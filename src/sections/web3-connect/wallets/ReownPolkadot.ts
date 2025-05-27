import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import ReownLogo from "assets/icons/Reown.svg"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ChainEcosystem, Parachain } from "@galacticcouncil/xcm-core"
import { AppKit, CaipNetwork, createAppKit } from "@reown/appkit"
import { defineChain } from "@reown/appkit/networks"
import UniversalProvider, {
  IUniversalProvider,
} from "@walletconnect/universal-provider"
import { PolkadotSigner } from "sections/web3-connect/signer/PolkadotSigner"
import { POLKADOT_APP_NAME } from "utils/api"
import { HYDRATION_CHAIN_KEY } from "utils/constants"
import { shortenAccountAddress } from "utils/formatting"
import { genesisHashToChain } from "utils/helpers"

const projectId = import.meta.env.VITE_WC_PROJECT_ID
const metadata = {
  name: POLKADOT_APP_NAME,
  description:
    "Hydration is a next-gen DeFi protocol which is designed to bring an ocean of liquidity to Polkadot",
  url: import.meta.env.VITE_DOMAIN_URL,
  icons: ["https://app.hydration.net/favicon/apple-touch-icon.png"],
}

const hydration = chainsMap.get(HYDRATION_CHAIN_KEY) as Parachain

const chainIdFromGenesisHash = (genesisHash: string) => {
  if (typeof genesisHash !== "string") throw new Error("Invalid genesis hash")
  return genesisHash.slice(2, 34)
}

const polkadotParachains = [...chainsMap.values()].filter(
  ({ ecosystem }) => ecosystem === ChainEcosystem.Polkadot,
) as Parachain[]

const wsToHttp = (url: string) =>
  url.replace(/^(ws)(s)?:\/\//, (_, _insecure, secure) =>
    secure ? "https://" : "http://",
  )

const parachainToCaipNetwork = ({
  name,
  genesisHash,
  ws,
  explorer,
}: Parachain): CaipNetwork => {
  const wsArr = typeof ws === "string" ? [ws] : ws

  const blockExplorersConfig = explorer
    ? { default: { name: `${name} Explorer`, url: explorer } }
    : undefined

  const chainId = chainIdFromGenesisHash(genesisHash)
  const chainInfo = genesisHashToChain(genesisHash as `0x${string}`)

  return defineChain({
    id: chainId,
    name,
    nativeCurrency: {
      name: chainInfo.displayName,
      symbol: chainInfo.symbols[0],
      decimals: chainInfo.decimals[0],
    },
    rpcUrls: {
      default: {
        http: wsArr.map(wsToHttp),
        wss: wsArr,
      },
    },
    blockExplorers: blockExplorersConfig,
    chainNamespace: "polkadot",
    caipNetworkId: `polkadot:${chainId}`,
  })
}

const hydrationChainConfig = parachainToCaipNetwork(hydration)
const parachainsConfig = polkadotParachains.map(parachainToCaipNetwork)

const parachainNetworkIds = parachainsConfig.map(
  ({ caipNetworkId }) => caipNetworkId,
)

export class ReownPolkadot implements Wallet {
  extensionName = WalletProviderType.ReownPolkadot
  title = "Reown"
  installUrl = ""
  logo = {
    src: ReownLogo,
    alt: "Reown Logo",
  }

  _modal: AppKit | undefined
  _signer: PolkadotSigner | undefined
  _extension: IUniversalProvider | undefined
  _provider: UniversalProvider | undefined

  onOpen?: () => void
  onSessionDelete?: () => void

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get modal() {
    return this._modal
  }

  get provider() {
    return this._provider
  }

  get installed() {
    return true
  }

  get rawExtension() {
    return this._extension
  }

  constructor({
    onOpen,
    onSessionDelete,
  }: { onOpen?: () => void; onSessionDelete?: () => void } = {}) {
    this.onOpen = onOpen
    this.onSessionDelete = onSessionDelete
  }

  initializeAppKit = async () => {
    if (this._modal) {
      return this._modal
    }

    const provider = await this.getProviderInstance()

    const modal = await new Promise<AppKit>((resolve) => {
      const appKit = createAppKit({
        projectId,
        metadata,
        networks: [hydrationChainConfig, ...parachainsConfig],
        allWallets: "HIDE",
        // @ts-ignore no idea why this shows as error, the types are same
        universalProvider: provider,
      })

      const unsub = appKit.subscribeState((state) => {
        if (state.initialized) {
          unsub()
          resolve(appKit)
        }
      })
    })

    this._modal = modal
    return modal
  }

  initializeProvider = async () => {
    const provider = await this.getProviderInstance()

    if (!provider) {
      throw new Error(
        "WalletConnectError: Connection failed. Please try again.",
      )
    }

    this._extension = provider

    const hasSession = !!provider.session

    if (!hasSession) {
      provider.on("display_uri", this.handleDisplayUri)
    }

    provider.on("session_delete", this.handleSessionDelete)
    return provider
  }

  getProviderInstance = async () => {
    if (!this._provider) {
      this._provider = await UniversalProvider.init({
        projectId,
        metadata,
      })
    }

    return this._provider
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    const provider = await this.initializeProvider()
    const modal = await this.initializeAppKit()

    if (!modal) {
      throw new Error("Reown is not initialized.")
    }

    const hasSession = !!provider.session
    if (!hasSession) {
      await provider.connect({
        optionalNamespaces: {
          polkadot: {
            methods: ["polkadot_signMessage", "polkadot_signTransaction"],
            chains: parachainNetworkIds,
            events: [],
          },
        },
      })
    }

    if (modal.isOpen()) modal.close()

    this._extension = provider

    if (provider.session) {
      this._signer = new PolkadotSigner(provider.client, provider.session)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this.provider?.session) return []

    const accounts = Object.values(this.provider.session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat()

    return accounts.slice(0, 1).map((account) => {
      const address = account.split(":")[2]
      return {
        address,
        source: this.extensionName,
        name: shortenAccountAddress(address),
        wallet: this,
        signer: this.signer,
      }
    })
  }

  handleDisplayUri = async (uri: string) => {
    if (!this.modal) return
    this.modal.open({
      view: "ConnectingWalletConnectBasic",
      uri,
      namespace: "polkadot",
    })
  }

  handleSessionDelete = async () => {
    this.disconnect()
    this.onSessionDelete?.()
  }

  transformError = (err: Error): Error => {
    return err
  }

  subscribeAccounts = async () => {}

  disconnect = async () => {
    if (this.modal) {
      this.modal.disconnect()
    }

    if (this.provider) {
      this.provider.off("display_uri", this.handleDisplayUri)
      this.provider.off("session_delete", this.handleSessionDelete)
      this.provider.disconnect()
    }
  }
}
