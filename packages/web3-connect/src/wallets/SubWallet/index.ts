import { isH160Address, isSS58Address } from "@galacticcouncil/utils"
import { InjectedPolkadotAccount } from "polkadot-api/pjs-signer"

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
  accountFilter = (account: InjectedPolkadotAccount) => {
    return isSS58Address(account.address)
  }
}

export class SubWalletH160 extends BaseSubstrateWallet {
  provider = WalletProviderType.SubwalletH160
  accessor = "subwallet-js"
  title = "SubWallet"
  installUrl =
    "https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0"
  logo = logo
  accountFilter = (account: InjectedPolkadotAccount) => {
    return isH160Address(account.address)
  }
}
export class SubWalletEvm extends BaseEIP1193Wallet {
  provider = WalletProviderType.SubwalletEvm
  accessor = "app.subwallet"
  title = "SubWallet"
  installUrl =
    "https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0"
  logo = logo
}
