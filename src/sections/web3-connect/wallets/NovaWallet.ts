import {
  NotInstalledError,
  BaseDotsamaWallet,
  WalletAccount,
} from "@talismn/connect-wallets"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import NovaWalletLogo from "assets/icons/NovaWallet.svg"
import {
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"

export class NovaWallet extends BaseDotsamaWallet {
  extensionName = WalletProviderType.PolkadotJS // Nova Wallet acts as polkadot-js wallet
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  appLink = `https://app.novawallet.io/open/dapp?url=https%3A%2F%2Fapp.hydration.net`
  logo = {
    src: NovaWalletLogo,
    alt: "Nova Wallet Logo",
  }
  get installed() {
    const injectedExtension = window?.injectedWeb3?.[this.extensionName]
    const isNovaWallet = window?.walletExtension?.isNovaWallet

    return !!(injectedExtension && isNovaWallet)
  }

  getAccounts = async (anyType?: boolean): Promise<WalletAccount[]> => {
    if (!this._extension) {
      throw new NotInstalledError(
        `The 'Wallet.enable(dappname)' function should be called first.`,
        this,
      )
    }

    const walletMode = useWeb3ConnectStore.getState().mode
    const accounts = await this._extension.accounts.get(anyType)
    const accountsWithWallet = accounts
      .filter(({ type }) =>
        walletMode === WalletMode.SubstrateH160
          ? type === "ethereum"
          : type === "sr25519" || type === "ed25519",
      )
      .map((account) => {
        return {
          ...account,
          source: this._extension?.name as string,
          wallet: this,
          signer: this._extension?.signer,
        }
      })

    return accountsWithWallet
  }
}
