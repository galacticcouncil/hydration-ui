import { EIP1193Provider } from "viem"

import { WalletProviderType } from "@/config/providers"
import { EIP6963AnnounceProviderEvent } from "@/types/evm"
import { UserRejectedError } from "@/utils/errors"
import { BaseNearWallet } from "@/wallets/BaseNearWallet"

import logo from "./logo.svg"

const METAMASK_RDNS = "io.metamask"
const USER_REJECTED_CODE = 4001

// NEAR's network as evm-on-near adds it
const NEAR_NETWORK = {
  chainId: "0x18d",
  chainName: "NEAR Protocol",
  nativeCurrency: { name: "NEAR", symbol: "NEAR", decimals: 18 },
  rpcUrls: ["https://eth-rpc.mainnet.near.org"],
  blockExplorerUrls: ["https://eth-explorer.near.org"],
}

/** The page's EVM wallet: MetaMask where it announces itself, else the default. */
const getInjectedProvider = (): EIP1193Provider | undefined => {
  let metaMask: EIP1193Provider | undefined
  const onAnnounce = (e: Event) => {
    const { info, provider } = (e as unknown as EIP6963AnnounceProviderEvent)
      .detail
    if (info.rdns === METAMASK_RDNS) metaMask = provider
  }

  // Wallets announce themselves synchronously when asked
  window.addEventListener("eip6963:announceProvider", onAnnounce)
  window.dispatchEvent(new Event("eip6963:requestProvider"))
  window.removeEventListener("eip6963:announceProvider", onAnnounce)

  return metaMask ?? window.ethereum
}

const isUserRejection = (err: unknown) =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === USER_REJECTED_CODE

/** MetaMask and other EVM wallets, each signing for a 0x… account on NEAR. */
export class EthereumWalletsNear extends BaseNearWallet {
  provider = WalletProviderType.EthereumWalletsNear
  accessor = "ethereum-wallets"
  // NEAR lists Ethereum wallets in a manifest of their own
  manifestUrl = "https://evm-on-near.dev/manifest.json"
  popupUrl = "https://evm-on-near.dev/"
  title = "Ethereum Wallets"
  installUrl = "https://evm-on-near.dev"
  logo = logo

  // evm-on-near adds NEAR's network only when the wallet reports it unknown
  // the standard way, and otherwise fails to connect, so it's added first
  beforeSignIn = async () => {
    const provider = getInjectedProvider()
    if (!provider) return

    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [NEAR_NETWORK],
      })
    } catch (err) {
      if (isUserRejection(err)) throw new UserRejectedError(this)
      // Anything else is left to evm-on-near, which tries on its own
    }
  }
}
