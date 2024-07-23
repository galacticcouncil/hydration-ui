import {
  NotInstalledError,
  TalismanWallet,
  WalletAccount,
} from "@talismn/connect-wallets"
import {
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"

export class Talisman extends TalismanWallet {
  extensionName = WalletProviderType.Talisman
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
          : type === "sr25519",
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
