import { pick } from "remeda"

import { WalletProviderType } from "@/config/providers"
import { Wallet, WalletData } from "@/types/wallet"
import { AlephZero } from "@/wallets/AlephZeroSigner"
import { Enkrypt } from "@/wallets/Enkrypt"
import { ExternalWallet } from "@/wallets/ExternalWallet"
import { FearlessWallet } from "@/wallets/FearlessWallet"
import { MantaWallet } from "@/wallets/MantaWallet"
import { MetaMask } from "@/wallets/MetaMask"
import { NovaWallet } from "@/wallets/NovaWallet"
import { PolkadotJS } from "@/wallets/PolkadotJS"
import { PolkaGate } from "@/wallets/PolkaGate"
import { RabbyWallet } from "@/wallets/RabbyWallet"
import { SubWallet, SubWalletEvm } from "@/wallets/SubWallet"
import { Talisman, TalismanEvm } from "@/wallets/Talisman"

export {
  AlephZero,
  Enkrypt,
  ExternalWallet,
  FearlessWallet,
  MantaWallet,
  MetaMask,
  NovaWallet,
  PolkadotJS,
  PolkaGate,
  RabbyWallet,
  SubWallet,
  SubWalletEvm,
  Talisman,
  TalismanEvm,
}

const wallets = [
  new AlephZero(),
  new Enkrypt(),
  new ExternalWallet(),
  new FearlessWallet(),
  new MantaWallet(),
  new MetaMask(),
  new NovaWallet(),
  new PolkaGate(),
  new PolkadotJS(),
  new RabbyWallet(),
  new SubWallet(),
  new SubWalletEvm(),
  new Talisman(),
  new TalismanEvm(),
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
