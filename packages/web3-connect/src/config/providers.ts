export enum WalletProviderType {
  AlephZero = "aleph-zero",
  BraveWallet = "bravewallet",
  BraveWalletSol = "bravewallet-sol",
  Enkrypt = "enkrypt",
  ExternalWallet = "external",
  FearlessWallet = "fearless-wallet",
  MantaWallet = "manta-wallet-js",
  MetaMask = "metamask",
  NovaWallet = "nova-wallet",
  Phantom = "phantom",
  PolkadotJS = "polkadot-js",
  Polkagate = "polkagate",
  RabbyWallet = "rabby-wallet",
  Solflare = "solflare",
  SubwalletEvm = "subwallet-evm",
  Subwallet = "subwallet",
  Talisman = "talisman",
  TalismanEvm = "talisman-evm",
  TrustWallet = "trustwallet",
  Slush = "slush",
  Suiet = "suiet",
  PhantomSui = "phantom-sui",
  WalletConnect = "walletconnect",
  WalletConnectEvm = "walletconnect-evm",
}

export const isWalletProviderType = (
  provider: string,
): provider is WalletProviderType => {
  return Object.values(WalletProviderType).includes(
    provider as WalletProviderType,
  )
}

export const TALISMAN_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.Talisman,
  WalletProviderType.TalismanEvm,
]

export const MOBILE_ONLY_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.NovaWallet,
]

export const DESKTOP_ONLY_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.PolkadotJS,
]

export const EVM_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.TalismanEvm,
  WalletProviderType.SubwalletEvm,
  WalletProviderType.TrustWallet,
  WalletProviderType.BraveWallet,
  WalletProviderType.RabbyWallet,
  WalletProviderType.WalletConnectEvm,
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
  WalletProviderType.Subwallet,
  WalletProviderType.Talisman,
]

export const SOLANA_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.Phantom,
  WalletProviderType.Solflare,
  WalletProviderType.BraveWalletSol,
]

export const SUI_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.Suiet,
  WalletProviderType.Slush,
  WalletProviderType.PhantomSui,
]

export const ALTERNATIVE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.ExternalWallet,
]
