import { getWallets } from "@mysten/wallet-standard"

import { WalletProviderType } from "@/config/providers"
import { BaseSuiWallet } from "@/wallets/BaseSuiWallet"

import logo from "./logo.svg"

export class Suiet extends BaseSuiWallet {
  provider = WalletProviderType.Suiet
  accessor = "Suiet"
  title = "Suiet"
  installUrl = "https://suiet.app"
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
