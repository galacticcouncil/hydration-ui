import { SubscriptionFn, Wallet, getWallets } from "@talismn/connect-wallets"

import { ExternalWallet } from "./ExternalWallet"
import { MetaMask } from "./MetaMask"
import { TalismanEvm } from "./TalismanEvm"
import { NovaWallet } from "./NovaWallet"
import { WalletConnect } from "./WalletConnect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { H160, isEvmAddress } from "utils/evm"
import { SubWalletEvm } from "sections/web3-connect/wallets/SubWalletEvm"
import { SubWallet } from "sections/web3-connect/wallets/SubWallet"
import { EIP6963AnnounceProviderEvent } from "sections/web3-connect/types"

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

const wallets = getWallets().filter(
  ({ extensionName }) => extensionName !== WalletProviderType.SubwalletJS,
)

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
const talismanEvm: Wallet = new TalismanEvm({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.TalismanEvm,
  ),
})
const subwallet: Wallet = new SubWallet()
const subwalletEvm: Wallet = new SubWalletEvm({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.SubwalletEvm,
  ),
})

const walletConnect: Wallet = new WalletConnect({
  onModalClose: (session) => {
    if (!session) {
      const state = useWeb3ConnectStore.getState()
      state.disconnect()
      if (state.open) {
        state.toggle()
      }
    }
  },
  onSesssionDelete: () => {
    const state = useWeb3ConnectStore.getState()
    state.disconnect()
  },
})

const externalWallet: Wallet = new ExternalWallet()

export const SUPPORTED_WALLET_PROVIDERS: WalletProvider[] = [
  ...wallets,
  talismanEvm,
  subwalletEvm,
  subwallet,
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

/**
 * Handles the event of EIP-6963 standard to announce injected Wallet Providers
 * For more information, refer to https://eips.ethereum.org/EIPS/eip-6963
 */
export function handleAnnounceProvider(event: EIP6963AnnounceProviderEvent) {
  if (event.detail.info.rdns === "io.metamask") {
    const metaMask: Wallet = new MetaMask({
      provider: event.detail.provider,
      onAccountsChanged: onMetaMaskLikeAccountChange(
        WalletProviderType.MetaMask,
      ),
    })

    SUPPORTED_WALLET_PROVIDERS.push({
      wallet: metaMask,
      type: normalizeProviderType(metaMask),
    })
  }
}
