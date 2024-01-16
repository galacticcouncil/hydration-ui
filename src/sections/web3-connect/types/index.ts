import { WalletAccount as DefaultWalletAccount } from "@talismn/connect-wallets"

export type WalletAccount = DefaultWalletAccount & {
  genesisHash?: `0x${string}`
}
