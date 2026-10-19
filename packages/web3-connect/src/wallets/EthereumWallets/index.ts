import { WalletProviderType } from "@/config/providers"
import { BaseNearWallet } from "@/wallets/BaseNearWallet"

import logo from "./logo.svg"

/** MetaMask and other EVM wallets, each signing for a 0x… account on NEAR. */
export class EthereumWalletsNear extends BaseNearWallet {
  provider = WalletProviderType.EthereumWalletsNear
  accessor = "ethereum-wallets"
  // NEAR lists Ethereum wallets in a manifest of their own
  manifestUrl = "https://evm-on-near.dev/manifest.json"
  popupUrl = "https://evm-on-near.dev/"
  title = "Ethereum Wallets"
  installUrl = "https://evm-on-near.dev"
  logo = logo
}
