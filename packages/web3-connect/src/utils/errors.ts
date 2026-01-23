import { Wallet } from "@/types/wallet"

export interface WalletError extends Error {
  readonly wallet: Wallet
}

export class BaseWalletError extends Error implements WalletError {
  name = "WalletError"
  readonly wallet: Wallet

  constructor(wallet: Wallet, message?: string) {
    super(message)
    this.wallet = wallet
  }
}

export class AuthError extends BaseWalletError {
  readonly name = "AuthError"
  readonly message = `${this.wallet.title} is installed but no accounts are available. Please check your wallet and allow accounts to use.`
}

export class NotInstalledError extends BaseWalletError {
  readonly name = "NotInstalledError"
  readonly message = `${this.wallet.title} could not be enabled. Refresh the browser if ${this.wallet.title} is already installed.`
}
