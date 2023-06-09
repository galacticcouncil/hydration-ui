import { WalletAggregator } from "@polkadot-onboard/core"
import { InjectedWalletProvider } from "@polkadot-onboard/injected-wallets"
import { PolkadotWalletsContextProvider } from "@polkadot-onboard/react"
import { WalletConnectProvider } from "@polkadot-onboard/wallet-connect"
import { ReactNode } from "react"

export const WALLET_CONNECT_PROJECT_ID = "c47a5369367ec2dad6b49c478eb772f9"
export const WALLET_CONNECT_RELAY_URL = "wss://relay.walletconnect.com"
export const HDX_CAIP_ID = "afdc188f45c71dacbaa0b62e16a91f72"

const walletConnectParams = {
  projectId: WALLET_CONNECT_PROJECT_ID,
  relayUrl: WALLET_CONNECT_RELAY_URL,
  metadata: {
    name: "HydraDX",
    description: "HydraDX",
    url: import.meta.env.VITE_DOMAIN_URL,
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
}
const walletAggregator = new WalletAggregator([
  new InjectedWalletProvider({}, "HydraDX"),
  new WalletConnectProvider(walletConnectParams, "HydraDX"),
])

type Props = { children: ReactNode }

export const OnboardProvider = ({ children }: Props) => {
  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      {children}
    </PolkadotWalletsContextProvider>
  )
}
