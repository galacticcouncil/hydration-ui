import { isH160Address, isSS58Address } from "@galacticcouncil/utils"
import { InjectedPolkadotAccount } from "polkadot-api/pjs-signer"

import { WalletProviderType } from "@/config/providers"
import { isMetaMask, isNovaWallet } from "@/utils"
import { BaseEIP1193Wallet } from "@/wallets/BaseEIP1193Wallet"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class NovaWallet extends BaseSubstrateWallet {
  provider = WalletProviderType.NovaWallet
  accessor = "polkadot-js" // Nova Wallet acts as polkadot-js wallet
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  logo = logo
  get installed() {
    return isNovaWallet(this.accessor)
  }
  accountFilter = (account: InjectedPolkadotAccount) => {
    return isSS58Address(account.address)
  }
}

export class NovaWalletH160 extends BaseSubstrateWallet {
  provider = WalletProviderType.NovaWalletH160
  accessor = "polkadot-js"
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  logo = logo
  get installed() {
    return isNovaWallet(this.accessor)
  }
  accountFilter = (account: InjectedPolkadotAccount) => {
    return isH160Address(account.address)
  }
}

export class NovaWalletEvm extends BaseEIP1193Wallet {
  provider = WalletProviderType.NovaWalletEvm
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  logo = logo
  get installed() {
    const isNovaWallet = !!window?.walletExtension?.isNovaWallet
    // Nova EVM injects ethereum object with isMetaMask set to true
    return isMetaMask(window.ethereum) && isNovaWallet
  }
  get rawExtension() {
    return window.ethereum
  }
}
