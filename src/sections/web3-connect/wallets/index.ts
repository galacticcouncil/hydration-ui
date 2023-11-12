import { Wallet, getWallets } from "@talismn/connect-wallets"

import { ExternalWallet } from "./ExternalWallet"
import { MetaMask } from "./MetaMask"
import { NovaWallet } from "./NovaWallet"
import { WalletConnect } from "./WalletConnect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"

export enum WalletProviderType {
  MetaMask = "metamask",
  Talisman = "talisman",
  SubwalletJS = "subwallet-js",
  Enkrypt = "enkrypt",
  PolkadotJS = "polkadot-js",
  NovaWallet = "nova-wallet",
  WalletConnect = "walletconnect",
  ExternalWallet = "external",
}

export type WalletProvider = {
  type: WalletProviderType
  wallet: Wallet
}

const EVM_CHAIN_ID = parseInt(import.meta.env.VITE_EVM_CHAIN_ID)

const novaWallet: Wallet = new NovaWallet()

const metaMask: Wallet = new MetaMask({
  onChainChanged(chainId) {
    if (chainId !== EVM_CHAIN_ID) {
      const state = useWeb3ConnectStore.getState()
      state.disconnect()
    }
  },
  onAccountsChanged(accounts, addresses) {
    const state = useWeb3ConnectStore.getState()
    if (!accounts || accounts.length === 0) {
      state.disconnect()
    } else {
      const [account] = accounts
      const [evmAddress] = addresses
      state.setAccount({
        evmAddress,
        address: account.address,
        provider: WalletProviderType.MetaMask,
        name: account.name ?? "",
        isExternalWalletConnected: false,
      })
    }
  },
})

const walletConnect: Wallet = new WalletConnect()

const externalWallet: Wallet = new ExternalWallet()

export const SUPPORTED_WALLET_PROVIDERS: WalletProvider[] = [
  metaMask,
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
