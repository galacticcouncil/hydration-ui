import { WalletProviderType } from "@/config/providers"
import { BaseEIP1193Wallet } from "@/wallets/BaseEIP1193Wallet"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class SubWallet extends BaseSubstrateWallet {
  provider = WalletProviderType.Subwallet
  accessor = "subwallet-js"
  title = "SubWallet"
  installUrl =
    "https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0"
  logo = logo
}

export class SubWalletEvm extends BaseEIP1193Wallet {
  provider = WalletProviderType.SubwalletEvm
  accessor = "app.subwallet"
  title = "SubWallet"
  installUrl =
    "https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0"
  logo = logo
}
