import { Wallet, getWallets } from "@talismn/connect-wallets"

import { ExternalWallet } from "./ExternalWallet"
import { MetaMask } from "./MetaMask"
import { NovaWallet } from "./NovaWallet"
import { WalletConnect } from "./WalletConnect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { H160, getEvmAddress, isEvmAddress } from "utils/evm"

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

const novaWallet: Wallet = new NovaWallet()

const metaMask: Wallet = new MetaMask({
  onAccountsChanged(accounts) {
    const state = useWeb3ConnectStore.getState()
    if (!accounts || accounts.length === 0) {
      state.disconnect()
    } else {
      const [{ address, name }] = accounts
      const isEvm = isEvmAddress(address)
      state.setAccount({
        address: isEvm ? new H160(address).toAccount() : address,
        evmAddress: isEvm ? getEvmAddress(address) : "",
        provider: WalletProviderType.MetaMask,
        name: name ?? "",
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

export function getSupportedWallets() {
  return SUPPORTED_WALLET_PROVIDERS
}
