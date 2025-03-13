import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import ReownLogo from "assets/icons/Reown.svg"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"

import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain } from "@galacticcouncil/xcm-core"
import { AppKit, createAppKit } from "@reown/appkit"
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5"
import { mainnet, moonbeam } from "@reown/appkit/networks"
import UniversalProvider, {
  IUniversalProvider,
} from "@walletconnect/universal-provider"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { POLKADOT_APP_NAME } from "utils/api"
import { HYDRATION_CHAIN_KEY } from "utils/constants"
import { shortenAccountAddress } from "utils/formatting"

const projectId = import.meta.env.VITE_WC_PROJECT_ID
const metadata = {
  name: POLKADOT_APP_NAME,
  description:
    "Hydration is a next-gen DeFi protocol which is designed to bring an ocean of liquidity to Polkadot",
  url: import.meta.env.VITE_DOMAIN_URL,
  icons: ["https://app.hydration.net/favicon/apple-touch-icon.png"],
}

const hydration = (chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain).evmChain

export class Reown implements Wallet {
  extensionName = WalletProviderType.Reown
  title = "Reown"
  installUrl = ""
  logo = {
    src: ReownLogo,
    alt: "Reown Logo",
  }

  _modal: AppKit | undefined
  _signer: EthereumSigner | undefined
  _extension: IUniversalProvider | undefined

  onOpen?: () => void
  onClose?: () => void

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get modal() {
    return this._modal
  }

  get installed() {
    return true
  }

  get rawExtension() {
    return this._extension
  }

  constructor({
    onOpen,
    onClose,
  }: { onOpen?: () => void; onClose?: () => void } = {}) {
    this.onOpen = onOpen
    this.onClose = onClose
  }

  initializeAppKit = async () => {
    if (this._modal) {
      return this._modal
    }

    const modal = await new Promise<AppKit>((resolve) => {
      const appKit = createAppKit({
        adapters: [new Ethers5Adapter()],
        projectId,
        metadata,
        networks: [hydration, mainnet, moonbeam],
        features: {
          email: true,
          connectMethodsOrder: ["email", "social", "wallet"],
          socials: ["discord", "google", "x", "github"],
        },
      })

      appKit.subscribeState((state) => {
        if (state.open) {
          this.onOpen?.()
        } else {
          this.onClose?.()
        }
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

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    const modal = await this.initializeAppKit()

    if (!modal) {
      throw new Error("Reown modal is not initialized.")
    }

    await new Promise(async (resolve) => {
      const isConnected = modal.getIsConnectedState()

      if (isConnected) {
        await this.updateSigner()
        return resolve(true)
      }

      await modal.open()

      const unsub = modal.subscribeWalletInfo(async (connectedWallet) => {
        if (connectedWallet) {
          unsub()

          await this.updateSigner()
          resolve(true)
        }
      })
    })
  }

  updateSigner = async () => {
    if (!this.modal) return

    const provider = this.modal.getProvider<UniversalProvider>("eip155")
    const address = this.modal.getAddress()
    if (address && provider) {
      this._extension = provider
      this._signer = new EthereumSigner(address, provider)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this.modal) return []

    const _address = this.modal.getAddress()
    const address = _address ?? ""

    return [
      {
        name: shortenAccountAddress(address),
        address,
        source: this.extensionName,
        wallet: this,
      },
    ]
  }

  transformError = (err: Error): Error => {
    return err
  }

  subscribeAccounts = async () => {}

  disconnect = async () => {
    if (!this.modal) return
    this.modal.disconnect()
  }
}
