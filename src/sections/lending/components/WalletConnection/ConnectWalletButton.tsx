import React from "react"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"

export interface ConnectWalletProps {
  funnel?: string
}

export const ConnectWalletButton: React.FC<ConnectWalletProps> = () => {
  return <Web3ConnectModalButton />
}
