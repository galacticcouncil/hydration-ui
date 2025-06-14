import { pick } from "remeda"

import { WalletProviderType } from "@/config/providers"
import { Wallet, WalletData } from "@/types/wallet"
import { Enkrypt } from "@/wallets/Enkrypt"
import { ExternalWallet } from "@/wallets/ExternalWallet"
import { MetaMask } from "@/wallets/MetaMask"
import { RabbyWallet } from "@/wallets/RabbyWallet"
import { SubWallet, SubWalletEvm } from "@/wallets/SubWallet"
import { Talisman, TalismanEvm } from "@/wallets/Talisman"

import { PolkadotJS } from "./PolkadotJS"

export {
  Enkrypt,
  ExternalWallet,
  MetaMask,
  PolkadotJS,
  RabbyWallet,
  SubWallet,
  SubWalletEvm,
  Talisman,
  TalismanEvm,
}

const wallets = [
  new Enkrypt(),
  new MetaMask(),
  new PolkadotJS(),
  new RabbyWallet(),
  new SubWallet(),
  new SubWalletEvm(),
  new Talisman(),
  new TalismanEvm(),
  new ExternalWallet(),
]

export function getWallets(): Wallet[] {
  return wallets
}

export function getWalletData(wallet: Wallet): WalletData {
  return pick(wallet, [
    "provider",
    "accessor",
    "title",
    "installUrl",
    "logo",
    "enabled",
    "installed",
  ])
}

export function getWallet(type: WalletProviderType): Wallet | undefined {
  return wallets.find((wallet) => wallet.provider === type)
}
