import { pick } from "remeda"

import { WalletProviderType } from "@/config/providers"
import { Wallet, WalletData } from "@/types/wallet"
import { AlephZero } from "@/wallets/AlephZeroSigner"
import { BraveWalletSol } from "@/wallets/BraveWallet"
import { Enkrypt } from "@/wallets/Enkrypt"
import { ExternalWallet } from "@/wallets/ExternalWallet"
import { FearlessWallet } from "@/wallets/FearlessWallet"
import { MantaWallet } from "@/wallets/MantaWallet"
import { MetaMask } from "@/wallets/MetaMask"
import { NovaWallet } from "@/wallets/NovaWallet"
import { Phantom } from "@/wallets/Phantom"
import { PhantomSui } from "@/wallets/PhantomSui"
import { PolkadotJS } from "@/wallets/PolkadotJS"
import { PolkaGate } from "@/wallets/PolkaGate"
import { RabbyWallet } from "@/wallets/RabbyWallet"
import { Solflare } from "@/wallets/Solflare"
import { SubWallet, SubWalletEvm } from "@/wallets/SubWallet"
import { Suiet } from "@/wallets/Suiet"
import { Talisman, TalismanEvm } from "@/wallets/Talisman"

export {
  AlephZero,
  BraveWalletSol,
  Enkrypt,
  ExternalWallet,
  FearlessWallet,
  MantaWallet,
  MetaMask,
  NovaWallet,
  Phantom,
  PhantomSui,
  PolkadotJS,
  PolkaGate,
  RabbyWallet,
  Solflare,
  SubWallet,
  SubWalletEvm,
  Suiet,
  Talisman,
  TalismanEvm,
}

const wallets = [
  new AlephZero(),
  new BraveWalletSol(),
  new Enkrypt(),
  new ExternalWallet(),
  new FearlessWallet(),
  new MantaWallet(),
  new MetaMask(),
  new NovaWallet(),
  new Phantom(),
  new PhantomSui(),
  new PolkaGate(),
  new PolkadotJS(),
  new RabbyWallet(),
  new Solflare(),
  new SubWallet(),
  new SubWalletEvm(),
  new Suiet(),
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
