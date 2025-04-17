import {
  NotInstalledError,
  SubWallet as SubWalletImpl,
  WalletAccount,
} from "@talismn/connect-wallets"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import {
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"

import SubWalletLogo from "assets/icons/SubWalletLogo.svg"

export class SubWallet extends SubWalletImpl {
  extensionName = WalletProviderType.SubwalletJS
  logo = {
    src: SubWalletLogo,
    alt: "SubWallet Logo",
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
