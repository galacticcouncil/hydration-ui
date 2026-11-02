import { pick } from "remeda"

import { WalletProviderType } from "@/config/providers"
import { Wallet, WalletData } from "@/types/wallet"
import { AlephZero } from "@/wallets/AlephZeroSigner"
import { BackpackSol, BackpackSui } from "@/wallets/Backpack"
import { BraveWallet, BraveWalletSol } from "@/wallets/BraveWallet"
import { Enkrypt } from "@/wallets/Enkrypt"
import { EthereumWalletsNear } from "@/wallets/EthereumWallets"
import { ExternalWallet } from "@/wallets/ExternalWallet"
import { FearlessWallet } from "@/wallets/FearlessWallet"
import { HotWalletNear } from "@/wallets/HotWallet"
import { IntearWallet } from "@/wallets/IntearWallet"
import { LedgerNear } from "@/wallets/Ledger"
import { MantaWallet } from "@/wallets/MantaWallet"
import { MetaMask, MetaMaskSol } from "@/wallets/MetaMask"
import { MeteorWallet } from "@/wallets/MeteorWallet"
import { NoirWallet } from "@/wallets/NoirWallet"
import { NovaWallet, NovaWalletEvm, NovaWalletH160 } from "@/wallets/NovaWallet"
import { OKXWallet, OKXWalletSol, OKXWalletSui } from "@/wallets/OKXWallet"
import { Phantom, PhantomSui } from "@/wallets/Phantom"
import { PolkadotJS } from "@/wallets/PolkadotJS"
import { PolkaGate } from "@/wallets/PolkaGate"
import { RabbyWallet } from "@/wallets/RabbyWallet"
import { ReownWalletConnect } from "@/wallets/ReownWalletConnect"
import { Slush } from "@/wallets/Slush"
import { Solflare } from "@/wallets/Solflare"
import { SubWallet, SubWalletEvm, SubWalletH160 } from "@/wallets/SubWallet"
import { Suiet } from "@/wallets/Suiet"
import {
  Talisman,
  TalismanEvm,
  TalismanH160,
  TalismanSol,
} from "@/wallets/Talisman"
import { TrustWalletSol } from "@/wallets/TrustWallet"

export {
  AlephZero,
  BackpackSol,
  BackpackSui,
  BraveWallet,
  BraveWalletSol,
  Enkrypt,
  EthereumWalletsNear,
  ExternalWallet,
  FearlessWallet,
  HotWalletNear,
  IntearWallet,
  LedgerNear,
  MantaWallet,
  MetaMask,
  MetaMaskSol,
  MeteorWallet,
  NoirWallet,
  NovaWallet,
  NovaWalletEvm,
  NovaWalletH160,
  OKXWallet,
  OKXWalletSol,
  OKXWalletSui,
  Phantom,
  PhantomSui,
  PolkadotJS,
  PolkaGate,
  RabbyWallet,
  ReownWalletConnect,
  Slush,
  Solflare,
  SubWallet,
  SubWalletEvm,
  SubWalletH160,
  Suiet,
  Talisman,
  TalismanEvm,
  TalismanH160,
  TalismanSol,
  TrustWalletSol,
}

const wallets = [
  // Substrate
  new PolkadotJS(),
  new NovaWallet(),
  new Talisman(),
  new SubWallet(),
  new AlephZero(),
  new Enkrypt(),
  new FearlessWallet(),
  new MantaWallet(),
  new PolkaGate(),

  // Substrate H160
  new SubWalletH160(),
  new TalismanH160(),
  new NovaWalletH160(),

  // EVM
  new MetaMask(),
  new NovaWalletEvm(),
  new BraveWallet(),
  new TalismanEvm(),
  new SubWalletEvm(),
  new RabbyWallet(),
  new OKXWallet(),

  // Solana
  new Phantom(),
  new Solflare(),
  new TalismanSol(),
  new BraveWalletSol(),
  new TrustWalletSol(),
  new OKXWalletSol(),
  new MetaMaskSol(),
  new BackpackSol(),

  // Sui
  new Suiet(),
  new Slush(),
  new PhantomSui(),
  new OKXWalletSui(),
  new BackpackSui(),

  // NEAR
  new MeteorWallet(),
  new HotWalletNear(),
  new IntearWallet(),
  new LedgerNear(),
  new EthereumWalletsNear(),

  // Zcash
  new NoirWallet(),

  // Other
  new ReownWalletConnect(),
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

export function getWallet(type?: WalletProviderType): Wallet | undefined {
  return wallets.find((wallet) => wallet.provider === type)
}
