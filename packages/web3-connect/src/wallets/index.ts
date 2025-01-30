import { WalletProviderType } from "@/config/providers"
import { Wallet } from "@/types/wallet"

import { PolkadotJS } from "./PolkadotJS"

export { PolkadotJS }

const wallets = [new PolkadotJS()]

export function getWallets(): Wallet[] {
  return wallets
}

export function getWalletByType(type: WalletProviderType): Wallet | undefined {
  return wallets.find((wallet) => wallet.provider === type)
}
