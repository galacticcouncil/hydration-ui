import { WalletAccountFilterOptionOverride, WalletMode } from "@/config/wallet"

// ponytail: split out from @/utils/wallet so the address-book merge/selfcheck
// path can import the mode-name lookup without dragging in wallet.ts's heavy
// SDK/ui/wasm top-level imports (breaks the standalone esbuild+node selfcheck).
const walletModeNames = {
  [WalletMode.Substrate]: "Polkadot",
  [WalletMode.EVM]: "EVM",
  [WalletMode.Solana]: "Solana",
  [WalletMode.Sui]: "Sui",
  [WalletMode.SubstrateH160]: "Substrate H160",
  [WalletMode.Near]: "NEAR",
  [WalletMode.Zcash]: "Zcash",
} satisfies Record<WalletAccountFilterOptionOverride, string>

export const getWalletModeName = (
  mode: WalletAccountFilterOptionOverride,
): string => walletModeNames[mode]
