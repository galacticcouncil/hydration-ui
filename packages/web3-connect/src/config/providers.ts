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
  NovaWalletEvm = "nova-wallet-evm",
  NovaWalletH160 = "nova-wallet-h160",
  Phantom = "phantom",
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

export const EVM_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.NovaWalletEvm,
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
  WalletProviderType.TalismanH160,
  WalletProviderType.SubwalletH160,
  WalletProviderType.NovaWalletH160,
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

export const NOVA_WALLET_BLACKLISTED_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
]
