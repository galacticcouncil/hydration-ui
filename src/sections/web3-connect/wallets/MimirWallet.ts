import { WalletProviderType } from "sections/web3-connect/constants/providers"
import MimirWalletLogo from "assets/icons/MimirWallet.svg"
import { Wallet } from "@talismn/connect-wallets"

export class MimirWallet implements Partial<Wallet> {
  appLink =
    "https://app.mimir.global/explorer/https%253A%252F%252Fapp.hydration.net/trade/swap"

  extensionName = WalletProviderType.MimirWallet
  title = "Mimir"

  logo = {
    src: MimirWalletLogo,
    alt: "Mimir Wallet Logo",
  }

  installed = true
  isDappOnly = true
}
