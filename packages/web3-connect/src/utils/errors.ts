import { Wallet } from "@/types/wallet"

export interface WalletError extends Error {
  readonly wallet: Wallet
}

export class BaseWalletError extends Error implements WalletError {
  name = "WalletError"
  readonly wallet: Wallet

  constructor(message: string, wallet: Wallet) {
    super(message)
    this.wallet = wallet
  }
}

export class AuthError extends BaseWalletError {
  readonly name = "AuthError"
}

export class NotInstalledError extends BaseWalletError {
  readonly name = "NotInstalledError"
}
