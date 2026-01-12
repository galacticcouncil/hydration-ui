import { getWallets } from "@mysten/wallet-standard"

import { WalletProviderType } from "@/config/providers"
import { BaseSuiWallet } from "@/wallets/BaseSuiWallet"

import logo from "./logo.svg"

export class Slush extends BaseSuiWallet {
  provider = WalletProviderType.Slush
  accessor = "Slush"
  title = "Slush"
  installUrl = "https://slush.app"
  logo = logo

  constructor() {
    super()
    const wallets = getWallets()

    const provider = wallets
      .get()
      .find(
        (wallet) =>
          wallet.chains.includes("sui:mainnet") &&
          wallet.name === this.accessor,
      )

    this._provider = provider
  }
}
