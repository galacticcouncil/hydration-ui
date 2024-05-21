import { SubscriptionFn, Wallet, getWallets } from "@talismn/connect-wallets"

import { ExternalWallet } from "./ExternalWallet"
import { MetaMask } from "./MetaMask"
import { TalismanEvm } from "./TalismanEvm"
import { NovaWallet } from "./NovaWallet"
import { WalletConnect } from "./WalletConnect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { H160, isEvmAddress } from "utils/evm"
import { SubWalletEvm } from "sections/web3-connect/wallets/SubWalletEvm"
import { Phantom } from "sections/web3-connect/wallets/Phantom"

const EVM_ENABLED = Boolean(
  import.meta.env.VITE_EVM_CHAIN_ID && import.meta.env.VITE_EVM_PROVIDER_URL,
)

export enum WalletProviderType {
  MetaMask = "metamask",
  Talisman = "talisman",
  TalismanEvm = "talisman-evm",
  SubwalletJS = "subwallet-js",
  SubwalletEvm = "subwallet-evm",
  PolkadotJS = "polkadot-js",
  NovaWallet = "nova-wallet",
  Phantom = "phantom",
  Enkrypt = "enkrypt",
  WalletConnect = "walletconnect",
  ExternalWallet = "external",
}

export type WalletProvider = {
  type: WalletProviderType
  wallet: Wallet
}

const onMetaMaskLikeAccountChange =
  (type: WalletProviderType): SubscriptionFn =>
  (accounts) => {
    const state = useWeb3ConnectStore.getState()
    if (!accounts || accounts.length === 0) {
      state.disconnect()
    } else {
      const [{ address, name }] = accounts
      const isEvm = isEvmAddress(address)
      state.setAccount({
        address: isEvm ? new H160(address).toAccount() : address,
        displayAddress: address,
        provider: type,
        name: name ?? "",
        isExternalWalletConnected: false,
      })
    }
  }

const novaWallet: Wallet = new NovaWallet()
const talisman: Wallet = new TalismanEvm({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.TalismanEvm,
  ),
})
const subwallet: Wallet = new SubWalletEvm({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.SubwalletEvm,
  ),
})
const phantom: Wallet = new Phantom({
  onAccountsChanged: onMetaMaskLikeAccountChange(WalletProviderType.Phantom),
})
const metaMask: Wallet = new MetaMask({
  onAccountsChanged: onMetaMaskLikeAccountChange(WalletProviderType.MetaMask),
})

const walletConnect: Wallet = new WalletConnect({
  onModalClose: (session) => {
    if (!session) {
      const state = useWeb3ConnectStore.getState()
      state.disconnect()
      state.toggle()
    }
  },
  onSesssionDelete: () => {
    const state = useWeb3ConnectStore.getState()
    state.disconnect()
  },
})

const externalWallet: Wallet = new ExternalWallet()

export const SUPPORTED_WALLET_PROVIDERS: WalletProvider[] = [
  ...(EVM_ENABLED ? [metaMask, talisman, subwallet] : []),
  ...getWallets(),
  novaWallet,
  walletConnect,
  externalWallet,
].map((wallet) => ({
  wallet,
  type: normalizeProviderType(wallet),
}))

function normalizeProviderType(wallet: Wallet): WalletProviderType {
  if (wallet instanceof NovaWallet) {
    return WalletProviderType.NovaWallet
  }

  return wallet.extensionName as WalletProviderType
}

export function getSupportedWallets() {
  return SUPPORTED_WALLET_PROVIDERS
}
