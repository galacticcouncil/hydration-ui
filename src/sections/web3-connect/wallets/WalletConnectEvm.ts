import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { WalletConnect } from "./WalletConnect"

export class WalletConnectEvm extends WalletConnect {
  extensionName = WalletProviderType.WalletConnectEvm
}
