export enum WalletProviderType {
  AlephZero = "aleph-zero",
  BackpackSol = "backpack-sol",
  BackpackSui = "backpack-sui",
  BraveWallet = "bravewallet",
  BraveWalletSol = "bravewallet-sol",
  Enkrypt = "enkrypt",
  ExternalWallet = "external",
  FearlessWallet = "fearless-wallet",
  MantaWallet = "manta-wallet-js",
  MetaMask = "metamask",
  MetaMaskSol = "metamask-sol",
  NightlySol = "nightly-sol",
  NightlySui = "nightly-sui",
  NovaWallet = "nova-wallet",
  NovaWalletEvm = "nova-wallet-evm",
  NovaWalletH160 = "nova-wallet-h160",
  OKXWallet = "okx-wallet",
  OKXWalletSol = "okx-wallet-sol",
  OKXWalletSui = "okx-wallet-sui",
  Phantom = "phantom",
  PhantomSui = "phantom-sui",
  PolkadotJS = "polkadot-js",
  Polkagate = "polkagate",
  RabbyWallet = "rabby-wallet",
  Solflare = "solflare",
  SubwalletEvm = "subwallet-evm",
  SubwalletH160 = "subwallet-h160",
  Subwallet = "subwallet",
  Talisman = "talisman",
  TalismanEvm = "talisman-evm",
  TalismanH160 = "talisman-h160",
  TalismanSol = "talisman-sol",
  TrustWalletSol = "trustwallet-sol",
  Slush = "slush",
  Suiet = "suiet",
  WalletConnect = "walletconnect",
  Multisig = "multisig",
}

export const isWalletProviderType = (
  provider: string,
): provider is WalletProviderType => {
  return Object.values(WalletProviderType).includes(
    provider as WalletProviderType,
  )
}

export const EVM_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.OKXWallet,
  WalletProviderType.NovaWalletEvm,
  WalletProviderType.TalismanEvm,
  WalletProviderType.SubwalletEvm,
  WalletProviderType.BraveWallet,
  WalletProviderType.RabbyWallet,
  WalletProviderType.WalletConnect,
]

export const SUBSTRATE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.PolkadotJS,
  WalletProviderType.Talisman,
  WalletProviderType.Subwallet,
  WalletProviderType.Enkrypt,
  WalletProviderType.NovaWallet,
  WalletProviderType.MantaWallet,
  WalletProviderType.FearlessWallet,
  WalletProviderType.Polkagate,
  WalletProviderType.AlephZero,
  WalletProviderType.WalletConnect,
]

export const SUBSTRATE_H160_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.TalismanH160,
  WalletProviderType.SubwalletH160,
  WalletProviderType.NovaWalletH160,
]

export const SOLANA_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.Phantom,
  WalletProviderType.Solflare,
  WalletProviderType.TrustWalletSol,
  WalletProviderType.OKXWalletSol,
  WalletProviderType.MetaMaskSol,
  WalletProviderType.BackpackSol,
  WalletProviderType.NightlySol,
  WalletProviderType.TalismanSol,
  WalletProviderType.BraveWalletSol,
]

export const SUI_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.Suiet,
  WalletProviderType.OKXWalletSui,
  WalletProviderType.BackpackSui,
  WalletProviderType.NightlySui,
  WalletProviderType.Slush,
  WalletProviderType.PhantomSui,
]

export const NOVA_WALLET_BLACKLISTED_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
]
